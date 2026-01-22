export interface CourseDto {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: number;
  teacherName: string;
  teacherCode: string;
  totalStudents: number;
  createdAt: string;
}

export interface CreateCourseDto {
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: number;
}

export interface UpdateCourseDto {
  courseName?: string;
  credits?: number;
  teacherId?: number;
}

export interface CourseClassDto {
  classId: number;
  className: string;
  totalSchedules: number;
  createdAt: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  teacherId?: number;
  minCredits?: number;
  maxCredits?: number;
}