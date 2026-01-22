export interface StudentProfileDto {
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

export interface UpdateStudentProfileDto {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface StudentGradeDto {
  enrollId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  finalScore?: number;
  enrollmentStatus: string;
  enrolledAt: string;
  teacherName: string;
}

export interface StudentScheduleDto {
  courseCode: string;
  courseName: string;
  className: string;
  dayOfTheWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherName: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'inactive';
}