import sql from "mssql";
import { getPool } from "../../config/database";
import { CreateEnrollmentDto, PaginationQuery } from "./enrollment.dto";

export class EnrollmentRepository {
  // Check if student already enrolled in course
  async existsByStudentAndCourse(
    studentId: number,
    courseId: number,
  ): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("studentId", sql.Int, studentId)
        .input("courseId", sql.Int, courseId).query(`
          SELECT COUNT(*) as count
          FROM enrollments
          WHERE studentId = @studentId AND courseId = @courseId AND status = 'enrolled'
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error("Error checking enrollment exists:", error);
      throw error;
    }
  }

  // Create enrollment
  async create(createDto: CreateEnrollmentDto): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("studentId", sql.Int, createDto.studentId)
        .input("courseId", sql.Int, createDto.courseId).query(`
          INSERT INTO enrollments (studentId, courseId, status)
          OUTPUT INSERTED.*
          VALUES (@studentId, @courseId, 'enrolled')
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error creating enrollment:", error);
      throw error;
    }
  }

  // Find all enrollments with pagination
  async findAll(
    query: PaginationQuery,
  ): Promise<{ enrollments: any[]; total: number }> {
    try {
      const pool = getPool();
      const {
        page = 1,
        size = 10,
        search,
        studentId,
        courseId,
        teacherId,
        status,
      } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push(
          `(s.fullName LIKE @search OR s.studentCode LIKE @search OR c.courseName LIKE @search OR c.courseCode LIKE @search)`,
        );
        request.input("search", sql.NVarChar, `%${search}%`);
      }

      if (studentId) {
        whereConditions.push("e.studentId = @studentId");
        request.input("studentId", sql.Int, studentId);
      }

      if (courseId) {
        whereConditions.push("e.courseId = @courseId");
        request.input("courseId", sql.Int, courseId);
      }

      if (teacherId) {
        whereConditions.push("c.teacherId = @teacherId");
        request.input("teacherId", sql.Int, teacherId);
      }

      if (status) {
        whereConditions.push("e.status = @status");
        request.input("status", sql.NVarChar, status);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Count total
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM enrollments e
        INNER JOIN students s ON e.studentId = s.studentId
        INNER JOIN courses c ON e.courseId = c.courseId
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input("offset", sql.Int, offset);
      request.input("size", sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          e.enrollId, e.studentId, e.courseId, e.classId, e.status, e.enrolledAt,
          s.studentCode, s.fullName as studentName,
          c.courseCode, c.courseName, c.credits, c.teacherId,
          t.fullName as teacherName,
          cl.className,
          g.finalScore
        FROM enrollments e
        INNER JOIN students s ON e.studentId = s.studentId
        INNER JOIN courses c ON e.courseId = c.courseId
        LEFT JOIN teachers t ON c.teacherId = t.teacherId
        LEFT JOIN classes cl ON e.classId = cl.classId
        LEFT JOIN grades g ON e.enrollId = g.enrollId
        ${whereClause}
        ORDER BY e.enrolledAt DESC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        enrollments: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error("Error finding all enrollments:", error);
      throw error;
    }
  }

  // Find enrollment by ID
  async findById(enrollId: number): Promise<any> {
  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input('enrollId', sql.Int, enrollId)
      .query(`
        SELECT 
          e.enrollId, e.studentId, e.courseId, e.classId, e.status, e.enrolledAt,
          s.studentCode, s.fullName as studentName,
          c.courseCode, c.courseName, c.credits, c.teacherId,
          t.fullName as teacherName,
          cl.className,
          g.finalScore
        FROM enrollments e
        INNER JOIN students s ON e.studentId = s.studentId
        INNER JOIN courses c ON e.courseId = c.courseId
        LEFT JOIN teachers t ON c.teacherId = t.teacherId
        LEFT JOIN classes cl ON e.classId = cl.classId
        LEFT JOIN grades g ON e.enrollId = g.enrollId
        WHERE e.enrollId = @enrollId
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error finding enrollment by ID:', error);
    throw error;
  }
}

  // Delete enrollment (drop course)
  async delete(enrollId: number): Promise<boolean> {
    try {
      const pool = getPool();

      // Option 1: Soft delete by updating status
      const result = await pool.request().input("enrollId", sql.Int, enrollId)
        .query(`
          UPDATE enrollments
          SET status = 'dropped', classId = NULL
          WHERE enrollId = @enrollId AND status = 'enrolled'
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      throw error;
    }
  }

  async hardDelete(enrollId: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool.request().input("enrollId", sql.Int, enrollId)
        .query(`
          DELETE FROM enrollments
          WHERE enrollId = @enrollId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error hard deleting enrollment:", error);
      throw error;
    }
  }
  async findByStudentAndCourse(
    studentId: number,
    courseId: number,
  ): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("studentId", sql.Int, studentId)
        .input("courseId", sql.Int, courseId).query(`
        SELECT *
        FROM enrollments
        WHERE studentId = @studentId AND courseId = @courseId
      `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error("Error finding enrollment:", error);
      throw error;
    }
  }

  async reactivate(enrollId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool.request().input("enrollId", sql.Int, enrollId)
        .query(`
        UPDATE enrollments
        SET status = 'enrolled', enrolledAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE enrollId = @enrollId
      `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error reactivating enrollment:", error);
      throw error;
    }
  }

  // Update enrollment with classId
  async updateClass(enrollId: number, classId: number): Promise<any> {
    try {
      const pool = getPool();
      await pool
        .request()
        .input("enrollId", sql.Int, enrollId)
        .input("classId", sql.Int, classId).query(`
        UPDATE enrollments
        SET classId = @classId
        WHERE enrollId = @enrollId
      `);

      return await this.findById(enrollId);
    } catch (error) {
      console.error("Error updating enrollment class:", error);
      throw error;
    }
  }
}
