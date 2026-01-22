 export interface TeacherProfileDto {
  teacherId: number;
  userId: number;
  teacherCode: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface UpdateTeacherProfileDto {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface TeacherCourseDto {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  totalStudents: number;
  createdAt: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'inactive';
}   