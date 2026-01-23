import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateClassDto, UpdateClassDto, PaginationQuery } from './class.dto';

export class ClassRepository {
  // Check if class name exists for a course
  async existsByClassNameAndCourse(className: string, courseId: number, excludeClassId?: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('className', sql.NVarChar, className)
        .input('courseId', sql.Int, courseId)
        .input('excludeClassId', sql.Int, excludeClassId || 0)
        .query(`
          SELECT COUNT(*) as count
          FROM classes
          WHERE className = @className AND courseId = @courseId AND classId != @excludeClassId
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking class name exists:', error);
      throw error;
    }
  }

  // Create class
  async create(createDto: CreateClassDto): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('className', sql.NVarChar, createDto.className)
        .input('courseId', sql.Int, createDto.courseId)
        .query(`
          INSERT INTO classes (className, courseId)
          OUTPUT INSERTED.*
          VALUES (@className, @courseId)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  // Find all classes with pagination
  async findAll(query: PaginationQuery): Promise<{ classes: any[]; total: number }> {
    try {
      const pool = getPool();
      const { page = 1, size = 10, search, courseId, teacherId } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push(`(cl.className LIKE @search OR c.courseName LIKE @search OR c.courseCode LIKE @search)`);
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (courseId) {
        whereConditions.push('cl.courseId = @courseId');
        request.input('courseId', sql.Int, courseId);
      }

      if (teacherId) {
        whereConditions.push('c.teacherId = @teacherId');
        request.input('teacherId', sql.Int, teacherId);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM classes cl
        INNER JOIN courses c ON cl.courseId = c.courseId
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input('offset', sql.Int, offset);
      request.input('size', sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          cl.classId, cl.className, cl.courseId, cl.createdAt,
          c.courseCode, c.courseName, c.credits, c.teacherId,
          t.fullName as teacherName,
          COUNT(DISTINCT s.scheduleId) as totalSchedules,
          COUNT(DISTINCT e.studentId) as totalStudents
        FROM classes cl
        INNER JOIN courses c ON cl.courseId = c.courseId
        LEFT JOIN teachers t ON c.teacherId = t.teacherId
        LEFT JOIN schedules s ON cl.classId = s.classId
        LEFT JOIN enrollments e ON c.courseId = e.courseId AND e.status = 'enrolled'
        ${whereClause}
        GROUP BY cl.classId, cl.className, cl.courseId, cl.createdAt, c.courseCode, c.courseName, c.credits, c.teacherId, t.fullName
        ORDER BY cl.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        classes: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error('Error finding all classes:', error);
      throw error;
    }
  }

  // Find class by ID
  async findById(classId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('classId', sql.Int, classId)
        .query(`
          SELECT 
            cl.classId, cl.className, cl.courseId, cl.createdAt,
            c.courseCode, c.courseName, c.credits, c.teacherId,
            t.fullName as teacherName,
            COUNT(DISTINCT s.scheduleId) as totalSchedules,
            COUNT(DISTINCT e.studentId) as totalStudents
          FROM classes cl
          INNER JOIN courses c ON cl.courseId = c.courseId
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          LEFT JOIN schedules s ON cl.classId = s.classId
          LEFT JOIN enrollments e ON c.courseId = e.courseId AND e.status = 'enrolled'
          WHERE cl.classId = @classId
          GROUP BY cl.classId, cl.className, cl.courseId, cl.createdAt, c.courseCode, c.courseName, c.credits, c.teacherId, t.fullName
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding class by ID:', error);
      throw error;
    }
  }

  // Update class
  async update(classId: number, updateDto: UpdateClassDto): Promise<any> {
    try {
      const pool = getPool();
      await pool
        .request()
        .input('classId', sql.Int, classId)
        .input('className', sql.NVarChar, updateDto.className)
        .query(`
          UPDATE classes
          SET className = @className
          WHERE classId = @classId
        `);

      return await this.findById(classId);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  // Delete class
  async delete(classId: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('classId', sql.Int, classId)
        .query(`
          DELETE FROM classes
          WHERE classId = @classId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Get students in a class (students enrolled in the course)
  async getStudents(classId: number): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('classId', sql.Int, classId)
        .query(`
          SELECT 
            s.studentId, s.studentCode, s.fullName,
            u.email,
            e.status as enrollmentStatus, e.enrolledAt,
            g.finalScore
          FROM classes cl
          INNER JOIN enrollments e ON cl.courseId = e.courseId AND e.status = 'enrolled'
          INNER JOIN students s ON e.studentId = s.studentId
          INNER JOIN users u ON s.userId = u.userId
          LEFT JOIN grades g ON e.enrollId = g.enrollId
          WHERE cl.classId = @classId
          ORDER BY s.fullName
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting class students:', error);
      throw error;
    }
  }
}