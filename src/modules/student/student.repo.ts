import sql from 'mssql';
import { getPool } from '../../config/database';
import { UpdateStudentProfileDto, PaginationQuery } from './student.dto';

export class StudentRepository {
  // Get all students with pagination
  async findAll(query: PaginationQuery): Promise<{ students: any[]; total: number }> {
    try {
      const pool = getPool();
      const { page = 1, size = 10, search, status } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push(`(s.fullName LIKE @search OR s.studentCode LIKE @search OR u.email LIKE @search)`);
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (status) {
        whereConditions.push('u.status = @status');
        request.input('status', sql.NVarChar, status);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM students s
        INNER JOIN users u ON s.userId = u.userId
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input('offset', sql.Int, offset);
      request.input('size', sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          s.studentId, s.userId, s.studentCode, s.fullName, 
          s.dateOfBirth, s.phone, s.address, s.createdAt, s.updatedAt,
          u.email, u.status
        FROM students s
        INNER JOIN users u ON s.userId = u.userId
        ${whereClause}
        ORDER BY s.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        students: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error('Error finding all students:', error);
      throw error;
    }
  }

  // Find student by ID
  async findById(studentId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('studentId', sql.Int, studentId)
        .query(`
          SELECT 
            s.studentId, s.userId, s.studentCode, s.fullName, 
            s.dateOfBirth, s.phone, s.address, s.createdAt, s.updatedAt,
            u.email, u.username, u.status
          FROM students s
          INNER JOIN users u ON s.userId = u.userId
          WHERE s.studentId = @studentId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding student by ID:', error);
      throw error;
    }
  }

  // Find student by userId
  async findByUserId(userId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            s.studentId, s.userId, s.studentCode, s.fullName, 
            s.dateOfBirth, s.phone, s.address, s.createdAt, s.updatedAt,
            u.email, u.username, u.status
          FROM students s
          INNER JOIN users u ON s.userId = u.userId
          WHERE s.userId = @userId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding student by userId:', error);
      throw error;
    }
  }

  // Update student profile
  async update(studentId: number, updateDto: UpdateStudentProfileDto): Promise<any> {
    try {
      const pool = getPool();
      const fields: string[] = [];
      const request = pool.request().input('studentId', sql.Int, studentId);

      if (updateDto.fullName !== undefined) {
        fields.push('fullName = @fullName');
        request.input('fullName', sql.NVarChar, updateDto.fullName);
      }

      if (updateDto.dateOfBirth !== undefined) {
        fields.push('dateOfBirth = @dateOfBirth');
        request.input('dateOfBirth', sql.Date, updateDto.dateOfBirth);
      }

      if (updateDto.phone !== undefined) {
        fields.push('phone = @phone');
        request.input('phone', sql.VarChar, updateDto.phone);
      }

      if (updateDto.address !== undefined) {
        fields.push('address = @address');
        request.input('address', sql.NVarChar, updateDto.address);
      }

      if (fields.length === 0) {
        return await this.findById(studentId);
      }

      await request.query(`
        UPDATE students
        SET ${fields.join(', ')}, updatedAt = GETDATE()
        WHERE studentId = @studentId
      `);

      return await this.findById(studentId);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Delete student (will cascade delete user)
  async delete(studentId: number): Promise<boolean> {
    try {
      const pool = getPool();
      
      // Get userId first
      const student = await this.findById(studentId);
      if (!student) return false;

      // Delete user (will cascade to student)
      const result = await pool
        .request()
        .input('userId', sql.Int, student.userId)
        .query(`
          DELETE FROM users
          WHERE userId = @userId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Get student grades (enrollments + scores)
  async getGrades(studentId: number): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('studentId', sql.Int, studentId)
        .query(`
          SELECT 
            e.enrollId, e.courseId, e.status as enrollmentStatus, e.enrolledAt,
            c.courseCode, c.courseName, c.credits,
            g.finalScore,
            t.fullName as teacherName
          FROM enrollments e
          INNER JOIN courses c ON e.courseId = c.courseId
          LEFT JOIN grades g ON e.enrollId = g.enrollId
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          WHERE e.studentId = @studentId
          ORDER BY e.enrolledAt DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting student grades:', error);
      throw error;
    }
  }

  // Get student schedule
  async getSchedule(studentId: number): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('studentId', sql.Int, studentId)
        .query(`
          SELECT 
            c.courseCode, c.courseName,
            cl.className,
            s.dayOfTheWeek, s.startTime, s.endTime, s.room,
            t.fullName as teacherName
          FROM students st
          INNER JOIN enrollments e ON st.studentId = e.studentId AND e.status = 'enrolled'
          INNER JOIN courses c ON e.courseId = c.courseId
          INNER JOIN classes cl ON c.courseId = cl.courseId
          LEFT JOIN schedules s ON cl.classId = s.classId
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          WHERE st.studentId = @studentId
          ORDER BY 
            CASE s.dayOfTheWeek
              WHEN 'Monday' THEN 1
              WHEN 'Tuesday' THEN 2
              WHEN 'Wednesday' THEN 3
              WHEN 'Thursday' THEN 4
              WHEN 'Friday' THEN 5
              WHEN 'Saturday' THEN 6
              WHEN 'Sunday' THEN 7
            END,
            s.startTime
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting student schedule:', error);
      throw error;
    }
  }
}