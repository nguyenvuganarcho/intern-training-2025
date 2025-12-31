export interface Course {
  id: number;
  name: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDto {
  name: string;
  duration: number;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  duration?: number;
}

export interface CourseResponseDto {
  id: number;
  name: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesListResponseDto {
  courses: CourseResponseDto[];
  total: number;
  page?: number;
  size?: number;
  totalPages?: number;
}