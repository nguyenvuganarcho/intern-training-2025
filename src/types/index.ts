export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  studentId?: number | null;
  teacherId?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

export interface Student {
  studentId: number;
  userId: number;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  userId: number;
  studentCode: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface UpdateStudentDto {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordRequest extends ChangePasswordDto {
  confirmPassword: string;
}

// Teacher types
export interface Teacher {
  teacherId: number;
  userId: number;
  teacherCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  email?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTeacherDto {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface TeacherListResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CreateTeacherDto {
  username: string;
  email: string;
  password: string;
  teacherCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

// Course types
export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: number;
  teacherName?: string;
  teacherCode?: string;
  createdAt: string;
}

export interface CreateCourseDto {
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: number;
}

export interface UpdateCourseDto {
  courseCode?: string;
  courseName?: string;
  credits?: number;
  teacherId?: number;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Class types
export interface Class {
  classId: number;
  courseId: number;
  className: string;
  courseCode?: string;
  courseName?: string;
  teacherName?: string;
  createdAt: string;
}

export interface CreateClassDto {
  courseId: number;
  className: string;
}

export interface UpdateClassDto {
  courseId?: number;
  className?: string;
}

export interface ClassListResponse {
  classes: Class[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface Enrollment {
  enrollId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  classId?: number | null;    
  className?: string | null;
  credits: number;
  teacherId: number;
  teacherName: string;
  status: 'enrolled' | 'dropped';
  enrolledAt: string;
  finalScore?: number;
}

export interface CreateEnrollmentDto {
  studentId: number;
  courseId: number;
}

export interface EnrollmentListResponse {
  enrollments: Enrollment[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Schedule types
export interface Schedule {
  scheduleId: number;
  classId: number;
  className: string;
  courseCode: string;
  courseName: string;
  teacherId: number;
  teacherName: string;
  dayOfTheWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; 
  endTime: string;    
  room: string;
  createdAt: string;
}

export interface CreateScheduleDto {
  classId: number;
  dayOfTheWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room: string;
}

export interface ScheduleListResponse {
  schedules: Schedule[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Grade types
export interface Grade {
  gradeId: number;
  enrollId: number;
  finalScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGradeDto {
  finalScore: number;
}

// Enrollment with grade info (for display)
export interface EnrollmentWithGrade extends Enrollment {
  gradeId?: number;
}