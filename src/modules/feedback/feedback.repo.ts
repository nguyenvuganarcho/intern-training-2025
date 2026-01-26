 import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateFeedbackDto, UpdateFeedbackDto, PaginationQuery } from './feedback.dto';

export class FeedbackRepository {
  // Create feedback
  async create(createDto: CreateFeedbackDto, userId: number): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('subject', sql.NVarChar, createDto.subject)
      .input('message', sql.NVarChar, createDto.message)
      .query(`
        INSERT INTO feedbacks (userId, subject, message, status, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@userId, @subject, @message, 'pending', GETDATE(), GETDATE())
      `);

    return result.recordset[0];
  }

  // Find all feedbacks with pagination
  async findAll(query: PaginationQuery): Promise<{ feedbacks: any[]; total: number }> {
    const pool = await getPool();
    const page = query.page || 1;
    const size = query.size || 10;
    const offset = (page - 1) * size;

    let whereConditions = [];
    let params: any = {};

    if (query.status) {
      whereConditions.push('f.status = @status');
      params.status = query.status;
    }

    if (query.userId) {
      whereConditions.push('f.userId = @userId');
      params.userId = query.userId;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const request = pool.request();
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM feedbacks f
      ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get paginated data
    const request2 = pool.request();
    Object.entries(params).forEach(([key, value]) => {
      request2.input(key, value);
    });
    request2.input('offset', sql.Int, offset);
    request2.input('size', sql.Int, size);

    const result = await request2.query(`
      SELECT 
        f.feedbackId,
        f.userId,
        u.fullName as userName,
        u.role as userRole,
        f.subject,
        f.message,
        f.status,
        f.response,
        f.respondedBy,
        ur.fullName as respondedByName,
        f.respondedAt,
        f.createdAt,
        f.updatedAt
      FROM feedbacks f
      INNER JOIN users u ON f.userId = u.userId
      LEFT JOIN users ur ON f.respondedBy = ur.userId
      ${whereClause}
      ORDER BY f.createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @size ROWS ONLY
    `);

    return {
      feedbacks: result.recordset,
      total,
    };
  }

  // Find feedback by ID
  async findById(feedbackId: number): Promise<any | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('feedbackId', sql.Int, feedbackId)
      .query(`
        SELECT 
          f.feedbackId,
          f.userId,
          u.fullName as userName,
          u.role as userRole,
          f.subject,
          f.message,
          f.status,
          f.response,
          f.respondedBy,
          ur.fullName as respondedByName,
          f.respondedAt,
          f.createdAt,
          f.updatedAt
        FROM feedbacks f
        INNER JOIN users u ON f.userId = u.userId
        LEFT JOIN users ur ON f.respondedBy = ur.userId
        WHERE f.feedbackId = @feedbackId
      `);

    return result.recordset[0] || null;
  }

  // Update feedback
  async update(
    feedbackId: number,
    updateDto: UpdateFeedbackDto,
    respondedBy: number
  ): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('feedbackId', sql.Int, feedbackId)
      .input('status', sql.NVarChar, updateDto.status)
      .input('response', sql.NVarChar, updateDto.response || null)
      .input('respondedBy', sql.Int, respondedBy)
      .query(`
        UPDATE feedbacks
        SET 
          status = @status,
          response = @response,
          respondedBy = @respondedBy,
          respondedAt = GETDATE(),
          updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE feedbackId = @feedbackId
      `);

    return result.recordset[0];
  }
}