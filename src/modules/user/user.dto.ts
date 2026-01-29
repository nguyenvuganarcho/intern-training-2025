export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'teacher';
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  studentCode?: string;
  teacherCode?: string;
}

export interface UpdateUserDto {
  email?: string;
  status?: 'active' | 'inactive';
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponseDto {
  userId: number;
  username: string;
  email: string;
   fullName?: string | null;  
  role: string;
  status: string;
  createdAt: string;
  profile?: StudentProfileDto | TeacherProfileDto;
}

export interface StudentProfileDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface TeacherProfileDto {
  teacherId: number;
  teacherCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  role?: 'admin' | 'student' | 'teacher';
  status?: 'active' | 'inactive';
}