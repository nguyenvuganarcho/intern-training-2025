import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateNotificationDto, PaginationQuery } from './notification.dto';

export class NotificationRepository {
  // Create notification
  async create(createDto: CreateNotificationDto): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, createDto.userId)
      .input('title', sql.NVarChar, createDto.title)
      .input('message', sql.NVarChar, createDto.message)
      .input('type', sql.NVarChar, createDto.type)
      .query(`
        INSERT INTO notifications (userId, title, message, type, isRead, createdAt)
        OUTPUT INSERTED.*
        VALUES (@userId, @title, @message, @type, 0, GETDATE())
      `);

    return result.recordset[0];
  }

  // Find all notifications for a user with pagination
  async findAll(
    userId: number,
    query: PaginationQuery
  ): Promise<{ notifications: any[]; total: number }> {
    const pool = await getPool();
    const page = query.page || 1;
    const size = query.size || 10;
    const offset = (page - 1) * size;

    let whereConditions = ['userId = @userId'];
    let params: any = { userId };

    if (query.isRead !== undefined) {
      whereConditions.push('isRead = @isRead');
      params.isRead = query.isRead;
    }

    if (query.type) {
      whereConditions.push('type = @type');
      params.type = query.type;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const request = pool.request();
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM notifications
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
        notificationId,
        userId,
        title,
        message,
        type,
        isRead,
        createdAt
      FROM notifications
      ${whereClause}
      ORDER BY createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @size ROWS ONLY
    `);

    return {
      notifications: result.recordset,
      total,
    };
  }

  // Find notification by ID
  async findById(notificationId: number): Promise<any | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('notificationId', sql.Int, notificationId)
      .query(`
        SELECT 
          notificationId,
          userId,
          title,
          message,
          type,
          isRead,
          createdAt
        FROM notifications
        WHERE notificationId = @notificationId
      `);

    return result.recordset[0] || null;
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('notificationId', sql.Int, notificationId)
      .query(`
        UPDATE notifications
        SET isRead = 1
        OUTPUT INSERTED.*
        WHERE notificationId = @notificationId
      `);

    return result.recordset[0];
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE notifications
        SET isRead = 1
        WHERE userId = @userId AND isRead = 0
      `);

    return result.rowsAffected[0];
  }

  // Get unread count
  async getUnreadCount(userId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT COUNT(*) as count
        FROM notifications
        WHERE userId = @userId AND isRead = 0
      `);

    return result.recordset[0].count;
  }
}