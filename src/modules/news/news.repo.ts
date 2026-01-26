import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateNewsDto, UpdateNewsDto, PaginationQuery } from './news.dto';

export class NewsRepository {
  // Create news
  async create(createDto: CreateNewsDto, authorId: number): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, createDto.title)
      .input('content', sql.NVarChar, createDto.content)
      .input('authorId', sql.Int, authorId)
      .query(`
        INSERT INTO news (title, content, authorId, publishedAt, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@title, @content, @authorId, GETDATE(), GETDATE(), GETDATE())
      `);

    return result.recordset[0];
  }

  // Find all news with pagination
  async findAll(query: PaginationQuery): Promise<{ news: any[]; total: number }> {
    const pool = await getPool();
    const page = query.page || 1;
    const size = query.size || 10;
    const offset = (page - 1) * size;

    let whereClause = '';
    let params: any = {};

    if (query.search) {
      whereClause = 'WHERE (n.title LIKE @search OR n.content LIKE @search)';
      params.search = `%${query.search}%`;
    }

    // Get total count
    const request = pool.request();
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM news n
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
        n.newsId,
        n.title,
        n.content,
        n.authorId,
        u.fullName as authorName,
        n.publishedAt,
        n.createdAt,
        n.updatedAt
      FROM news n
      INNER JOIN users u ON n.authorId = u.userId
      ${whereClause}
      ORDER BY n.publishedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @size ROWS ONLY
    `);

    return {
      news: result.recordset,
      total,
    };
  }

  // Find news by ID
  async findById(newsId: number): Promise<any | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('newsId', sql.Int, newsId)
      .query(`
        SELECT 
          n.newsId,
          n.title,
          n.content,
          n.authorId,
          u.fullName as authorName,
          n.publishedAt,
          n.createdAt,
          n.updatedAt
        FROM news n
        INNER JOIN users u ON n.authorId = u.userId
        WHERE n.newsId = @newsId
      `);

    return result.recordset[0] || null;
  }

  // Update news
  async update(newsId: number, updateDto: UpdateNewsDto): Promise<any> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('newsId', sql.Int, newsId)
      .input('title', sql.NVarChar, updateDto.title)
      .input('content', sql.NVarChar, updateDto.content)
      .query(`
        UPDATE news
        SET 
          title = @title,
          content = @content,
          updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE newsId = @newsId
      `);

    return result.recordset[0];
  }

  // Delete news
  async delete(newsId: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('newsId', sql.Int, newsId)
      .query('DELETE FROM news WHERE newsId = @newsId');

    return result.rowsAffected[0] > 0;
  }
}