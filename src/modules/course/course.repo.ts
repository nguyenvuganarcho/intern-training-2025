import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateCourseDto, UpdateCourseDto, PaginationQuery } from './course.dto';

export class CourseRepository {
  // Check course code exists
  async existsByCourseCode(courseCode: string, excludeCourseId?: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('courseCode', sql.NVarChar, courseCode)
        .input('excludeCourseId', sql.Int, excludeCourseId || 0)
        .query(`
          SELECT COUNT(*) as count
          FROM courses
          WHERE courseCode = @courseCode AND courseId != @excludeCourseId
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking course code exists:', error);
      throw error;
    }
  }

  // Create course
  async create(createDto: CreateCourseDto): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('courseCode', sql.NVarChar, createDto.courseCode)
        .input('courseName', sql.NVarChar, createDto.courseName)
        .input('credits', sql.Int, createDto.credits)
        .input('teacherId', sql.Int, createDto.teacherId)
        .query(`
          INSERT INTO courses (courseCode, courseName, credits, teacherId)
          OUTPUT INSERTED.*
          VALUES (@courseCode, @courseName, @credits, @teacherId)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Find all courses with pagination
  async findAll(query: PaginationQuery): Promise<{ courses: any[]; total: number }> {
    try {
      const pool = getPool();
      const { page = 1, size = 10, search, teacherId, minCredits, maxCredits } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push(`(c.courseName LIKE @search OR c.courseCode LIKE @search)`);
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (teacherId) {
        whereConditions.push('c.teacherId = @teacherId');
        request.input('teacherId', sql.Int, teacherId);
      }

      if (minCredits) {
        whereConditions.push('c.credits >= @minCredits');
        request.input('minCredits', sql.Int, minCredits);
      }

      if (maxCredits) {
        whereConditions.push('c.credits <= @maxCredits');
        request.input('maxCredits', sql.Int, maxCredits);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM courses c
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input('offset', sql.Int, offset);
      request.input('size', sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          c.courseId, c.courseCode, c.courseName, c.credits, c.teacherId, c.createdAt,
          t.fullName as teacherName, t.teacherCode,
          COUNT(DISTINCT e.studentId) as totalStudents
        FROM courses c
        LEFT JOIN teachers t ON c.teacherId = t.teacherId
        LEFT JOIN enrollments e ON c.courseId = e.courseId AND e.status = 'enrolled'
        ${whereClause}
        GROUP BY c.courseId, c.courseCode, c.courseName, c.credits, c.teacherId, c.createdAt, t.fullName, t.teacherCode
        ORDER BY c.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        courses: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error('Error finding all courses:', error);
      throw error;
    }
  }

  // Find course by ID
  async findById(courseId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('courseId', sql.Int, courseId)
        .query(`
          SELECT 
            c.courseId, c.courseCode, c.courseName, c.credits, c.teacherId, c.createdAt,
            t.fullName as teacherName, t.teacherCode,
            COUNT(DISTINCT e.studentId) as totalStudents
          FROM courses c
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          LEFT JOIN enrollments e ON c.courseId = e.courseId AND e.status = 'enrolled'
          WHERE c.courseId = @courseId
          GROUP BY c.courseId, c.courseCode, c.courseName, c.credits, c.teacherId, c.createdAt, t.fullName, t.teacherCode
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding course by ID:', error);
      throw error;
    }
  }

  // Update course
  async update(courseId: number, updateDto: UpdateCourseDto): Promise<any> {
    try {
      const pool = getPool();
      const fields: string[] = [];
      const request = pool.request().input('courseId', sql.Int, courseId);

      if (updateDto.courseName !== undefined) {
        fields.push('courseName = @courseName');
        request.input('courseName', sql.NVarChar, updateDto.courseName);
      }

      if (updateDto.credits !== undefined) {
        fields.push('credits = @credits');
        request.input('credits', sql.Int, updateDto.credits);
      }

      if (updateDto.teacherId !== undefined) {
        fields.push('teacherId = @teacherId');
        request.input('teacherId', sql.Int, updateDto.teacherId);
      }

      if (fields.length === 0) {
        return await this.findById(courseId);
      }

      await request.query(`
        UPDATE courses
        SET ${fields.join(', ')}
        WHERE courseId = @courseId
      `);

      return await this.findById(courseId);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete course
  async delete(courseId: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('courseId', sql.Int, courseId)
        .query(`
          DELETE FROM courses
          WHERE courseId = @courseId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Get available courses (not enrolled by specific student)
  async findAvailable(studentId?: number): Promise<any[]> {
    try {
      const pool = getPool();
      const request = pool.request();

      let query = `
        SELECT 
          c.courseId, c.courseCode, c.courseName, c.credits, c.teacherId, c.createdAt,
          t.fullName as teacherName, t.teacherCode,
          COUNT(DISTINCT e.studentId) as totalStudents
        FROM courses c
        LEFT JOIN teachers t ON c.teacherId = t.teacherId
        LEFT JOIN enrollments e ON c.courseId = e.courseId AND e.status = 'enrolled'
      `;

      if (studentId) {
        query += `
          WHERE c.courseId NOT IN (
            SELECT courseId 
            FROM enrollments 
            WHERE studentId = @studentId AND status = 'enrolled'
          )
        `;
        request.input('studentId', sql.Int, studentId);
      }

      query += `
        GROUP BY c.courseId, c.courseCode, c.courseName, c.credits, c.teacherId, c.createdAt, t.fullName, t.teacherCode
        ORDER BY c.courseName
      `;

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error finding available courses:', error);
      throw error;
    }
  }

  // Get classes of a course
  async getClasses(courseId: number): Promise<any[]> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('courseId', sql.Int, courseId)
        .query(`
          SELECT 
            cl.classId, cl.className, cl.createdAt,
            COUNT(s.scheduleId) as totalSchedules
          FROM classes cl
          LEFT JOIN schedules s ON cl.classId = s.classId
          WHERE cl.courseId = @courseId
          GROUP BY cl.classId, cl.className, cl.createdAt
          ORDER BY cl.className
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting course classes:', error);
      throw error;
    }
  }
}   