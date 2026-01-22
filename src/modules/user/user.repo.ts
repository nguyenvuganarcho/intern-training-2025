import sql from 'mssql';
import { getPool } from '../../config/database';
import { CreateUserDto, UpdateUserDto, PaginationQuery } from './user.dto';

export class UserRepository {
  // Check username exists
  async existsByUsername(username: string, excludeUserId?: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('username', sql.NVarChar, username)
        .input('excludeUserId', sql.Int, excludeUserId || 0)
        .query(`
          SELECT COUNT(*) as count
          FROM users
          WHERE username = @username AND userId != @excludeUserId
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking username exists:', error);
      throw error;
    }
  }

  // Check email exists
  async existsByEmail(email: string, excludeUserId?: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('email', sql.NVarChar, email)
        .input('excludeUserId', sql.Int, excludeUserId || 0)
        .query(`
          SELECT COUNT(*) as count
          FROM users
          WHERE email = @email AND userId != @excludeUserId
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking email exists:', error);
      throw error;
    }
  }

  // Check student code exists
  async existsByStudentCode(studentCode: string): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('studentCode', sql.NVarChar, studentCode)
        .query(`
          SELECT COUNT(*) as count
          FROM students
          WHERE studentCode = @studentCode
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking student code exists:', error);
      throw error;
    }
  }

  // Check teacher code exists
  async existsByTeacherCode(teacherCode: string): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('teacherCode', sql.NVarChar, teacherCode)
        .query(`
          SELECT COUNT(*) as count
          FROM teachers
          WHERE teacherCode = @teacherCode
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking teacher code exists:', error);
      throw error;
    }
  }

  // Create user with transaction (user + student/teacher)
  async create(createDto: CreateUserDto, hashedPassword: string): Promise<any> {
    const pool = getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Insert user
      const userResult = await transaction
        .request()
        .input('username', sql.NVarChar, createDto.username)
        .input('password', sql.NVarChar, hashedPassword)
        .input('email', sql.NVarChar, createDto.email)
        .input('role', sql.NVarChar, createDto.role)
        .query(`
          INSERT INTO users (username, password, email, role)
          OUTPUT INSERTED.*
          VALUES (@username, @password, @email, @role)
        `);

      const user = userResult.recordset[0];

      // 2. Insert student/teacher profile if needed
      if (createDto.role === 'student') {
        await transaction
          .request()
          .input('userId', sql.Int, user.userId)
          .input('studentCode', sql.NVarChar, createDto.studentCode)
          .input('fullName', sql.NVarChar, createDto.fullName || '')
          .input('dateOfBirth', sql.Date, createDto.dateOfBirth || null)
          .input('phone', sql.VarChar, createDto.phone || null)
          .input('address', sql.NVarChar, createDto.address || null)
          .query(`
            INSERT INTO students (userId, studentCode, fullName, dateOfBirth, phone, address)
            VALUES (@userId, @studentCode, @fullName, @dateOfBirth, @phone, @address)
          `);
      } else if (createDto.role === 'teacher') {
        await transaction
          .request()
          .input('userId', sql.Int, user.userId)
          .input('teacherCode', sql.NVarChar, createDto.teacherCode)
          .input('fullName', sql.NVarChar, createDto.fullName || '')
          .input('dateOfBirth', sql.Date, createDto.dateOfBirth || null)
          .input('phone', sql.VarChar, createDto.phone || null)
          .input('address', sql.NVarChar, createDto.address || null)
          .query(`
            INSERT INTO teachers (userId, teacherCode, fullName, dateOfBirth, phone, address)
            VALUES (@userId, @teacherCode, @fullName, @dateOfBirth, @phone, @address)
          `);
      }

      await transaction.commit();
      return user;
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find all with pagination
  async findAll(query: PaginationQuery): Promise<{ users: any[]; total: number }> {
    try {
      const pool = getPool();
      const { page = 1, size = 10, search, role, status } = query;

      let whereConditions: string[] = [];
      const request = pool.request();

      if (search) {
        whereConditions.push('(u.username LIKE @search OR u.email LIKE @search)');
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (role) {
        whereConditions.push('u.role = @role');
        request.input('role', sql.NVarChar, role);
      }

      if (status) {
        whereConditions.push('u.status = @status');
        request.input('status', sql.NVarChar, status);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Get paginated data
      const offset = (page - 1) * size;
      request.input('offset', sql.Int, offset);
      request.input('size', sql.Int, size);

      const dataResult = await request.query(`
        SELECT 
          u.userId, u.username, u.email, u.role, u.status, u.createdAt,
          s.studentId, s.studentCode, s.fullName as studentName, 
          s.dateOfBirth as studentDOB, s.phone as studentPhone, s.address as studentAddress,
          t.teacherId, t.teacherCode, t.fullName as teacherName,
          t.dateOfBirth as teacherDOB, t.phone as teacherPhone, t.address as teacherAddress
        FROM users u
        LEFT JOIN students s ON u.userId = s.userId
        LEFT JOIN teachers t ON u.userId = t.userId
        ${whereClause}
        ORDER BY u.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY
      `);

      return {
        users: dataResult.recordset,
        total,
      };
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // Find by ID
  async findById(userId: number): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            u.userId, u.username, u.email, u.role, u.status, u.createdAt, u.password,
            s.studentId, s.studentCode, s.fullName as studentName, 
            s.dateOfBirth as studentDOB, s.phone as studentPhone, s.address as studentAddress,
            t.teacherId, t.teacherCode, t.fullName as teacherName,
            t.dateOfBirth as teacherDOB, t.phone as teacherPhone, t.address as teacherAddress
          FROM users u
          LEFT JOIN students s ON u.userId = s.userId
          LEFT JOIN teachers t ON u.userId = t.userId
          WHERE u.userId = @userId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Update user
  async update(userId: number, updateDto: UpdateUserDto): Promise<any> {
    const pool = getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Update users table
      const userFields: string[] = [];
      const request = transaction.request().input('userId', sql.Int, userId);

      if (updateDto.email !== undefined) {
        userFields.push('email = @email');
        request.input('email', sql.NVarChar, updateDto.email);
      }

      if (updateDto.status !== undefined) {
        userFields.push('status = @status');
        request.input('status', sql.NVarChar, updateDto.status);
      }

      if (userFields.length > 0) {
        await request.query(`
          UPDATE users
          SET ${userFields.join(', ')}
          WHERE userId = @userId
        `);
      }

      // 2. Update student/teacher profile if provided
      const profileFields: string[] = [];
      const profileRequest = transaction.request().input('userId', sql.Int, userId);

      if (updateDto.fullName !== undefined) {
        profileFields.push('fullName = @fullName');
        profileRequest.input('fullName', sql.NVarChar, updateDto.fullName);
      }

      if (updateDto.dateOfBirth !== undefined) {
        profileFields.push('dateOfBirth = @dateOfBirth');
        profileRequest.input('dateOfBirth', sql.Date, updateDto.dateOfBirth);
      }

      if (updateDto.phone !== undefined) {
        profileFields.push('phone = @phone');
        profileRequest.input('phone', sql.VarChar, updateDto.phone);
      }

      if (updateDto.address !== undefined) {
        profileFields.push('address = @address');
        profileRequest.input('address', sql.NVarChar, updateDto.address);
      }

      if (profileFields.length > 0) {
        // Update students
        await profileRequest.query(`
          UPDATE students
          SET ${profileFields.join(', ')}
          WHERE userId = @userId
        `);

        // Update teachers
        await profileRequest.query(`
          UPDATE teachers
          SET ${profileFields.join(', ')}
          WHERE userId = @userId
        `);
      }

      await transaction.commit();

      // Return updated user
      return await this.findById(userId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (cascade will delete student/teacher)
  async delete(userId: number): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
          DELETE FROM users
          WHERE userId = @userId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    try {
      const pool = getPool();
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('password', sql.NVarChar, hashedPassword)
        .query(`
          UPDATE users
          SET password = @password
          WHERE userId = @userId
        `);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}