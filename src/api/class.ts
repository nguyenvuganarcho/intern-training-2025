import client from './client';
import type { Class, CreateClassDto, UpdateClassDto, ClassListResponse, ApiResponse } from '../types';

interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
} 

export const getClassesApi = async (
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<ClassListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await client.get<ApiResponse<ClassListResponse>>(`/classes?${params}`);
  return response.data.data;
};

export const getClassByIdApi = async (id: number): Promise<Class> => {
  const response = await client.get<ApiResponse<Class>>(`/classes/${id}`);
  return response.data.data;
};

export const createClassApi = async (data: CreateClassDto): Promise<Class> => {
  const response = await client.post<ApiResponse<Class>>('/classes', data);
  return response.data.data;
};

export const updateClassApi = async (id: number, data: UpdateClassDto): Promise<Class> => {
  const response = await client.put<ApiResponse<Class>>(`/classes/${id}`, data);
  return response.data.data;
};

export const deleteClassApi = async (id: number): Promise<void> => {
  await client.delete(`/classes/${id}`);
};

export const getCoursesForDropdownApi = async (): Promise<Course[]> => {
  const response = await client.get<ApiResponse<{ courses: Course[] }>>('/courses?size=100');
  return response.data.data.courses.map((c: Course) => ({
    courseId: c.courseId,
    courseCode: c.courseCode,
    courseName: c.courseName,
  }));
};