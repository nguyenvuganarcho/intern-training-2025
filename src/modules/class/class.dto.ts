export interface ClassDto {
  classId: number;
  className: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: number;
  teacherName: string;
  totalSchedules: number;
  totalStudents: number;
  createdAt: string;
}

export interface CreateClassDto {
  className: string;
  courseId: number;
}

export interface UpdateClassDto {
  className?: string;
}

export interface ClassStudentDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  enrollmentStatus: string;
  enrolledAt: string;
  finalScore?: number;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  courseId?: number;
  teacherId?: number;
}