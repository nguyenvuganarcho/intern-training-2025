import sql from 'mssql';
import { getPool } from '../../config/database';
import { UpdateTeacherProfileDto, PaginationQuery } from './teacher.dto';

export class TeacherRepository {
  // Get all teachers with pagination
  async findAll(query: PaginationQuery): Promise<{ teachers: any[]; total: number }> {
    try {
      const pool = getPool();
      const { page = 1, size = 10, search, status } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push(`(t.fullName LIKE @search OR t.teacherCode LIKE @search OR u.email LIKE @search)`);
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
        FROM teachers t
        INNER JOIN users u ON t.userId = u.userId
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input('offset', sql.Int, offset);
      request.input('size', sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          t.teacherId, t.userId, t.teacherCode, t.fullName, 
          t.dateOfBirth, t.phone, t.address, t.createdAt,
          u.email, u.status
        FROM teachers t
        INNER JOIN users u ON t.userId = u.userId
        ${whereClause}
        ORDER BY t.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        teachers: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error('Error finding all teachers:', error);
      throw error;
    }
  }

  // Find teacher by ID
  async findById(teacherId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('teacherId', sql.Int, teacherId)
        .query(`
          SELECT 
            t.teacherId, t.userId, t.teacherCode, t.fullName, 
            t.dateOfBirth, t.phone, t.address, t.createdAt,
            u.email, u.username, u.status
          FROM teachers t
          INNER JOIN users u ON t.userId = u.userId
          WHERE t.teacherId = @teacherId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding teacher by ID:', error);
      throw error;
    }
  }

  // Find teacher by userId
  async findByUserId(userId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            t.teacherId, t.userId, t.teacherCode, t.fullName, 
            t.dateOfBirth, t.phone, t.address, t.createdAt,
            u.email, u.username, u.status
          FROM teachers t
          INNER JOIN users u ON t.userId = u.userId
          WHERE t.userId = @userId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding teacher by userId:', error);
      throw error;
    }
  }

  // Update teacher profile
  async update(teacherId: number, updateDto: UpdateTeacherProfileDto): Promise<any> {
    try {
      const pool = getPool();
      const fields: string[] = [];
      const request = pool.request().input('teacherId', sql.Int, teacherId);

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
        return await this.findById(teacherId);
      }

      await request.query(`
        UPDATE teachers
        SET ${fields.join(', ')}
        WHERE teacherId = @teacherId
      `);

      return await this.findById(teacherId);
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }

  // Delete teacher (will cascade delete user)
  async delete(teacherId: number): Promise<boolean> {
    try {
      const pool = getPool();
      
      // Get userId first
      const teacher = await this.findById(teacherId);
      if (!teacher) return false;

      // Delete user (will cascade to teacher)
      const result = await pool
        .request()
        .input('userId', sql.Int, teacher.userId)
        .query(`
          DELETE FROM users
          WHERE userId = @userId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }

  // Get courses taught by teacher
  async getCourses(teacherId: number): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('teacherId', sql.Int, teacherId)
        .query(`
          SELECT 
            c.courseId, c.courseCode, c.courseName, c.credits, c.createdAt,
            COUNT(DISTINCT e.studentId) as totalStudents
          FROM courses c
          LEFT JOIN enrollments e ON c.courseId = e.courseId AND e.status = 'enrolled'
          WHERE c.teacherId = @teacherId
          GROUP BY c.courseId, c.courseCode, c.courseName, c.credits, c.createdAt
          ORDER BY c.createdAt DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting teacher courses:', error);
      throw error;
    }
  }
}