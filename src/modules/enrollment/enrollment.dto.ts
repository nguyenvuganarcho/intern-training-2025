export interface EnrollmentDto {
  enrollId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  courseId: number;
  courseCode: string;
  courseName: string;
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

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  studentId?: number;
  courseId?: number;
  teacherId?: number;
  status?: 'enrolled' | 'dropped';
}