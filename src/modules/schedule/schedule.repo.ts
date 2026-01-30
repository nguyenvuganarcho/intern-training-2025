import sql from "mssql";
import { getPool } from "../../config/database";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  PaginationQuery,
  CheckConflictDto,
} from "./schedule.dto";

export class ScheduleRepository {
  // Create schedule
  async create(createDto: CreateScheduleDto): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("classId", sql.Int, createDto.classId)
        .input("dayOfTheWeek", sql.NVarChar, createDto.dayOfTheWeek)
        .input("startTime", sql.Time, createDto.startTime)
        .input("endTime", sql.Time, createDto.endTime)
        .input("room", sql.NVarChar, createDto.room).query(`
          INSERT INTO schedules (classId, dayOfTheWeek, startTime, endTime, room)
          OUTPUT INSERTED.*
          VALUES (@classId, @dayOfTheWeek, @startTime, @endTime, @room)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  }

  // Find all schedules with pagination
  async findAll(
    query: PaginationQuery,
  ): Promise<{ schedules: any[]; total: number }> {
    try {
      const pool = getPool();
      const {
        page = 1,
        size = 10,
        search,
        classId,
        teacherId,
        dayOfTheWeek,
        room,
      } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push(
          `(cl.className LIKE @search OR c.courseName LIKE @search OR c.courseCode LIKE @search OR s.room LIKE @search)`,
        );
        request.input("search", sql.NVarChar, `%${search}%`);
      }

      if (classId) {
        whereConditions.push("s.classId = @classId");
        request.input("classId", sql.Int, classId);
      }

      if (teacherId) {
        whereConditions.push("c.teacherId = @teacherId");
        request.input("teacherId", sql.Int, teacherId);
      }

      if (dayOfTheWeek) {
        whereConditions.push("s.dayOfTheWeek = @dayOfTheWeek");
        request.input("dayOfTheWeek", sql.NVarChar, dayOfTheWeek);
      }

      if (room) {
        whereConditions.push("s.room LIKE @room");
        request.input("room", sql.NVarChar, `%${room}%`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Count total
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM schedules s
        INNER JOIN classes cl ON s.classId = cl.classId
        INNER JOIN courses c ON cl.courseId = c.courseId
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input("offset", sql.Int, offset);
      request.input("size", sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          s.scheduleId, s.classId, s.dayOfTheWeek,
          CONVERT(VARCHAR(8), s.startTime, 108) as startTime,
          CONVERT(VARCHAR(8), s.endTime, 108) as endTime,
          s.room, s.createdAt,
          cl.className,
          c.courseId, c.courseCode, c.courseName, c.teacherId,
          t.fullName as teacherName
        FROM schedules s
        INNER JOIN classes cl ON s.classId = cl.classId
        INNER JOIN courses c ON cl.courseId = c.courseId
        LEFT JOIN teachers t ON c.teacherId = t.teacherId
        ${whereClause}
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
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        schedules: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error("Error finding all schedules:", error);
      throw error;
    }
  }

  // Find schedule by ID
  async findById(scheduleId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("scheduleId", sql.Int, scheduleId).query(`
          SELECT 
            s.scheduleId, s.classId, s.dayOfTheWeek, 
            CONVERT(VARCHAR(8), s.startTime, 108) as startTime,
            CONVERT(VARCHAR(8), s.endTime, 108) as endTime,
            s.room, s.createdAt,
            cl.className,
            c.courseId, c.courseCode, c.courseName, c.teacherId,
            t.fullName as teacherName
          FROM schedules s
          INNER JOIN classes cl ON s.classId = cl.classId
          INNER JOIN courses c ON cl.courseId = c.courseId
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          WHERE s.scheduleId = @scheduleId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error("Error finding schedule by ID:", error);
      throw error;
    }
  }

  // Update schedule
  async update(scheduleId: number, updateDto: UpdateScheduleDto): Promise<any> {
    try {
      const pool = getPool();
      const fields: string[] = [];
      const request = pool.request().input("scheduleId", sql.Int, scheduleId);

      if (updateDto.dayOfTheWeek !== undefined) {
        fields.push("dayOfTheWeek = @dayOfTheWeek");
        request.input("dayOfTheWeek", sql.NVarChar, updateDto.dayOfTheWeek);
      }

      if (updateDto.startTime !== undefined) {
        fields.push("startTime = @startTime");
        request.input("startTime", sql.Time, updateDto.startTime);
      }

      if (updateDto.endTime !== undefined) {
        fields.push("endTime = @endTime");
        request.input("endTime", sql.Time, updateDto.endTime);
      }

      if (updateDto.room !== undefined) {
        fields.push("room = @room");
        request.input("room", sql.NVarChar, updateDto.room);
      }

      if (fields.length === 0) {
        return await this.findById(scheduleId);
      }

      await request.query(`
        UPDATE schedules
        SET ${fields.join(", ")}
        WHERE scheduleId = @scheduleId
      `);

      return await this.findById(scheduleId);
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  }

  // Delete schedule
  async delete(scheduleId: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input("scheduleId", sql.Int, scheduleId).query(`
          DELETE FROM schedules
          WHERE scheduleId = @scheduleId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  }

  // Check conflicts
  async checkConflicts(dto: CheckConflictDto): Promise<any[]> {
    try {
      const pool = getPool();
      const request = pool
        .request()
        .input("classId", sql.Int, dto.classId)
        .input("dayOfTheWeek", sql.NVarChar, dto.dayOfTheWeek)
        .input("startTime", sql.Time, dto.startTime)
        .input("endTime", sql.Time, dto.endTime)
        .input("room", sql.NVarChar, dto.room)
        .input("excludeScheduleId", sql.Int, dto.excludeScheduleId || 0);

      // Get class info
      const classInfo = await request.query(`
        SELECT c.courseId, c.teacherId
        FROM classes cl
        INNER JOIN courses c ON cl.courseId = c.courseId
        WHERE cl.classId = @classId
      `);

      if (classInfo.recordset.length === 0) {
        return [];
      }

      const teacherId = classInfo.recordset[0].teacherId;

      // Check room conflict
      const roomConflicts = await pool
        .request()
        .input("dayOfTheWeek", sql.NVarChar, dto.dayOfTheWeek)
        .input("startTime", sql.Time, dto.startTime)
        .input("endTime", sql.Time, dto.endTime)
        .input("room", sql.NVarChar, dto.room)
        .input("excludeScheduleId", sql.Int, dto.excludeScheduleId || 0).query(`
          SELECT 
            s.scheduleId, s.classId, s.dayOfTheWeek,
            CONVERT(VARCHAR(8), s.startTime, 108) as startTime,
            CONVERT(VARCHAR(8), s.endTime, 108) as endTime, s.room,
            cl.className,
            c.courseCode, c.courseName,
            t.fullName as teacherName,
            'room' as conflictType
          FROM schedules s
          INNER JOIN classes cl ON s.classId = cl.classId
          INNER JOIN courses c ON cl.courseId = c.courseId
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          WHERE s.scheduleId != @excludeScheduleId
            AND s.dayOfTheWeek = @dayOfTheWeek
            AND s.room = @room
            AND (
              (@startTime < s.endTime AND @endTime > s.startTime)
            )
        `);

      // Check teacher conflict
      const teacherConflicts = await pool
        .request()
        .input("teacherId", sql.Int, teacherId)
        .input("dayOfTheWeek", sql.NVarChar, dto.dayOfTheWeek)
        .input("startTime", sql.Time, dto.startTime)
        .input("endTime", sql.Time, dto.endTime)
        .input("excludeScheduleId", sql.Int, dto.excludeScheduleId || 0).query(`
          SELECT 
            s.scheduleId, s.classId, s.dayOfTheWeek,
            CONVERT(VARCHAR(8), s.startTime, 108) as startTime,
            CONVERT(VARCHAR(8), s.endTime, 108) as endTime, s.room,
            cl.className,
            c.courseCode, c.courseName,
            t.fullName as teacherName,
            'teacher' as conflictType
          FROM schedules s
          INNER JOIN classes cl ON s.classId = cl.classId 
          INNER JOIN courses c ON cl.courseId = c.courseId
          LEFT JOIN teachers t ON c.teacherId = t.teacherId
          WHERE s.scheduleId != @excludeScheduleId
            AND c.teacherId = @teacherId
            AND s.dayOfTheWeek = @dayOfTheWeek
            AND (
              (@startTime < s.endTime AND @endTime > s.startTime)
            )
        `);

      return [...roomConflicts.recordset, ...teacherConflicts.recordset];
    } catch (error) {
      console.error("Error checking conflicts:", error);
      throw error;
    }
  }
}
