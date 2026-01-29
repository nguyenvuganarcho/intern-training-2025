export interface User {
  userId: number;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  status: 'active' | 'inactive';
  lockedUntil: Date | null;
  failedLoginAttempts: number;
  createdAt: Date;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface UserResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string | null; 
  role: string;
  status: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ResetPasswordRequestDto {
  email: string;
}

export interface ConfirmResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

