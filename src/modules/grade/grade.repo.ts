import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateGradeDto, UpdateGradeDto } from './grade.dto';

export class GradeRepository {
  // Check if grade exists for enrollment
  async existsByEnrollId(enrollId: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('enrollId', sql.Int, enrollId)
      .query('SELECT 1 FROM grades WHERE enrollId = @enrollId');

    return result.recordset.length > 0;
  }

  // Create new grade
  async create(
    createDto: CreateGradeDto,
    gradedBy: number
  ): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('enrollId', sql.Int, createDto.enrollId)
      .input('finalScore', sql.Decimal(4, 2), createDto.finalScore)
      .input('gradedBy', sql.Int, gradedBy)
      .query(`
        INSERT INTO grades (enrollId, finalScore, gradedBy, gradedAt, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@enrollId, @finalScore, @gradedBy, GETDATE(), GETDATE(), GETDATE())
      `);

    return result.recordset[0];
  }

  // Bulk create grades
  async bulkCreate(
    grades: CreateGradeDto[],
    gradedBy: number
  ): Promise<any[]> {
    const pool = await getPool();
    
    // Build values for bulk insert
    const values = grades.map((_, index) => 
      `(@enrollId${index}, @finalScore${index}, @gradedBy, GETDATE(), GETDATE(), GETDATE())`
    ).join(', ');

    const request = pool.request().input('gradedBy', sql.Int, gradedBy);
    
    grades.forEach((grade, index) => {
      request.input(`enrollId${index}`, sql.Int, grade.enrollId);
      request.input(`finalScore${index}`, sql.Decimal(4, 2), grade.finalScore);
    });

    const result = await request.query(`
      INSERT INTO grades (enrollId, finalScore, gradedBy, gradedAt, createdAt, updatedAt)
      OUTPUT INSERTED.*
      VALUES ${values}
    `);

    return result.recordset;
  }

  // Find grade by ID
  async findById(gradeId: number): Promise<any | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('gradeId', sql.Int, gradeId)
      .query(`
        SELECT 
          g.gradeId,
          g.enrollId,
          s.studentId,
          s.studentCode,
          us.fullName as studentName,
          c.courseId,
          c.courseCode,
          c.courseName,
          c.credits,
          t.teacherId,
          ut.fullName as teacherName,
          g.finalScore,
          g.gradedAt,
          g.gradedBy,
          ug.fullName as gradedByName,
          g.createdAt,
          g.updatedAt
        FROM grades g
        INNER JOIN enrollments e ON g.enrollId = e.enrollId
        INNER JOIN students s ON e.studentId = s.studentId
        INNER JOIN courses c ON e.courseId = c.courseId
        INNER JOIN teachers t ON c.teacherId = t.teacherId
        INNER JOIN users us ON s.userId = us.userId
        INNER JOIN users ut ON t.userId = ut.userId
        INNER JOIN users ug ON g.gradedBy = ug.userId
        WHERE g.gradeId = @gradeId
      `);

    return result.recordset[0] || null;
  }

  // Update grade
  async update(
    gradeId: number,
    updateDto: UpdateGradeDto
  ): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('gradeId', sql.Int, gradeId)
      .input('finalScore', sql.Decimal(4, 2), updateDto.finalScore)
      .query(`
        UPDATE grades
        SET 
          finalScore = @finalScore,
          updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE gradeId = @gradeId
      `);

    return result.recordset[0];
  }

  // Get enrollment details
  async getEnrollment(enrollId: number): Promise<any | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('enrollId', sql.Int, enrollId)
      .query(`
        SELECT 
          e.enrollId,
          e.studentId,
          e.courseId,
          e.status,
          c.teacherId
        FROM enrollments e
        INNER JOIN courses c ON e.courseId = c.courseId
        WHERE e.enrollId = @enrollId
      `);

    return result.recordset[0] || null;
  }
}