import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repo';
import {
  LoginRequestDto,
  LoginResponseDto,
  UserResponseDto,
  TokenPayload,
  ResetPasswordRequestDto,
  ConfirmResetPasswordDto,
  RefreshTokenRequestDto,
} from './auth.dto';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
} from '../../common/errors';

export class AuthService {
  private repo: AuthRepository;
  private saltRounds = 10;
  private jwtSecret: string;
  private accessTokenExpiry: number;
  private refreshTokenExpiry: number;
  private maxLoginAttempts: number;
  private lockTime: number;

  // In-memory store for refresh tokens (production: use Redis)
  private refreshTokens: Map<string, { userId: number; expiresAt: Date }> = new Map();

  // In-memory store for reset tokens (production: use Redis)
  private resetTokens: Map<string, { userId: number; expiresAt: Date }> = new Map();

  constructor() {
    this.repo = new AuthRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.accessTokenExpiry = parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '3600', 10);
    this.refreshTokenExpiry = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10);
    this.maxLoginAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
    this.lockTime = parseInt(process.env.LOCK_TIME || '900000', 10);
  }

  private toUserResponseDto(user: any): UserResponseDto {
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  private generateAccessToken(user: any): string {
    const payload: TokenPayload = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  private generateRefreshToken(userId: number): string {
    const token = jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
    });

    // Store refresh token
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiry * 1000);
    this.refreshTokens.set(token, { userId, expiresAt });

    return token;
  }

  // LOGIN
  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. Find user
    const user = await this.repo.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 2. Check if account is locked
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const remainingTime = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 1000
      );
      throw new TooManyRequestsError(
        `Account locked. Try again in ${remainingTime} seconds`,
        remainingTime
      );
    }

    // 3. Check if account is inactive (but not locked)
    if (user.status === 'inactive' && (!user.lockedUntil || new Date() >= new Date(user.lockedUntil))) {
      throw new ForbiddenError('Account is inactive');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await this.repo.incrementFailedAttempts(user.userId);

      const newAttempts = user.failedLoginAttempts + 1;

      // Lock account if max attempts reached
      if (newAttempts >= this.maxLoginAttempts) {
        const lockUntil = new Date(Date.now() + this.lockTime);
        await this.repo.lockAccount(user.userId, lockUntil);

        throw new TooManyRequestsError(
          `Too many failed attempts. Account locked for ${this.lockTime / 1000} seconds`,
          this.lockTime / 1000
        );
      }

      throw new UnauthorizedError('Invalid credentials');
    }

    // 5. Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.repo.resetFailedAttempts(user.userId);
    }

    // 6. Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.userId);

    return {
      accessToken,
      refreshToken,
      user: this.toUserResponseDto(user),
    };
  }

  // REFRESH TOKEN
  async refreshToken(dto: RefreshTokenRequestDto): Promise<{ accessToken: string }> {
    try {
      // 1. Verify refresh token
      const decoded = jwt.verify(dto.refreshToken, this.jwtSecret) as any;

      // 2. Check if token exists in store
      const storedToken = this.refreshTokens.get(dto.refreshToken);
      if (!storedToken || storedToken.userId !== decoded.userId) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // 3. Check if token expired
      if (new Date() > storedToken.expiresAt) {
        this.refreshTokens.delete(dto.refreshToken);
        throw new UnauthorizedError('Refresh token expired');
      }

      // 4. Get user
      const user = await this.repo.findByUsername(decoded.username);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('User not found or inactive');
      }

      // 5. Generate new access token
      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  // LOGOUT
  async logout(refreshToken: string): Promise<void> {
    // Remove refresh token from store
    this.refreshTokens.delete(refreshToken);
  }

  // RESET PASSWORD REQUEST
  async resetPasswordRequest(dto: ResetPasswordRequestDto): Promise<void> {
    // 1. Find user by email
    const user = await this.repo.findByEmail(dto.email);

    if (!user) {
      // Don't reveal if email exists (security)
      return;
    }

    // 2. Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign({ userId: user.userId }, this.jwtSecret, {
      expiresIn: 3600, // 1 hour
    });

    // 3. Store reset token
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    this.resetTokens.set(resetToken, { userId: user.userId, expiresAt });

    // 4. TODO: Send email with reset token
    console.log(`Reset token for ${user.email}: ${resetToken}`);
  }

  // CONFIRM RESET PASSWORD
  async confirmResetPassword(dto: ConfirmResetPasswordDto): Promise<void> {
    try {
      // 1. Verify token
      const decoded = jwt.verify(dto.token, this.jwtSecret) as any;

      // 2. Check if token exists in store
      const storedToken = this.resetTokens.get(dto.token);
      if (!storedToken || storedToken.userId !== decoded.userId) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }

      // 3. Check if token expired
      if (new Date() > storedToken.expiresAt) {
        this.resetTokens.delete(dto.token);
        throw new UnauthorizedError('Reset token expired');
      }

      // 4. Hash new password
      const hashedPassword = await bcrypt.hash(dto.newPassword, this.saltRounds);

      // 5. Update password
      await this.repo.updatePassword(decoded.userId, hashedPassword);

      // 6. Remove reset token
      this.resetTokens.delete(dto.token);

      // 7. Remove all refresh tokens for this user (force re-login)
      for (const [token, data] of this.refreshTokens.entries()) {
        if (data.userId === decoded.userId) {
          this.refreshTokens.delete(token);
        }
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }
      throw error;
    }
  }
}