import sql from 'mssql';
import { getPool } from '../../config/database';
import { User } from './auth.dto';

export class AuthRepository {
  // Find user by username
  async findByUsername(username: string): Promise<any> {
  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT 
          u.userId, 
          u.username, 
          u.password, 
          u.email, 
          u.role, 
          u.status,
          u.createdAt,
          u.failedLoginAttempts,
          u.lockedUntil,
          s.studentId,
          s.fullName as studentName,  
          t.teacherId, 
          t.fullName as teacherName     
        FROM users u
        LEFT JOIN students s ON u.userId = s.userId   
        LEFT JOIN teachers t ON u.userId = t.userId  
        WHERE u.username = @username
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
}

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    try {
      const pool = getPool();
      const result = await pool
        .request()
        .input('email', sql.NVarChar, email)
        .query(`
          SELECT 
            userId, username, password, email, role, status,
            lockedUntil, failedLoginAttempts, createdAt
          FROM users
          WHERE email = @email
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Update failed login attempts
  async incrementFailedAttempts(userId: number): Promise<void> {
    try {
      const pool = getPool();
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
          UPDATE users
          SET failedLoginAttempts = failedLoginAttempts + 1
          WHERE userId = @userId
        `);
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
      throw error;
    }
  }

  // Lock user account
  async lockAccount(userId: number, lockUntil: Date): Promise<void> {
    try {
      const pool = getPool();
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('lockUntil', sql.DateTime, lockUntil)
        .query(`
          UPDATE users
          SET lockedUntil = @lockUntil,
              status = 'inactive'
          WHERE userId = @userId
        `);
    } catch (error) {
      console.error('Error locking account:', error);
      throw error;
    }
  }

  // Reset failed attempts
  async resetFailedAttempts(userId: number): Promise<void> {
    try {
      const pool = getPool();
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
          UPDATE users
          SET failedLoginAttempts = 0,
              lockedUntil = NULL,
              status = 'active'
          WHERE userId = @userId
        `);
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
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