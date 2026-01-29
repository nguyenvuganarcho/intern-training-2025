import client from './client';
import type { Course, CreateCourseDto, UpdateCourseDto, CourseListResponse, ApiResponse } from '../types';

interface TeacherUser {
  profile: {
    teacherId: number;
    teacherCode: string;
    fullName?: string;
  };
  username: string;
}


export const getCoursesApi = async (
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<CourseListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await client.get<ApiResponse<CourseListResponse>>(`/courses?${params}`);
  return response.data.data;
};

export const getCourseByIdApi = async (id: number): Promise<Course> => {
  const response = await client.get<ApiResponse<Course>>(`/courses/${id}`);
  return response.data.data;
};

export const createCourseApi = async (data: CreateCourseDto): Promise<Course> => {
  const response = await client.post<ApiResponse<Course>>('/courses', data);
  return response.data.data;
};

export const updateCourseApi = async (id: number, data: UpdateCourseDto): Promise<Course> => {
  const response = await client.put<ApiResponse<Course>>(`/courses/${id}`, data);
  return response.data.data;
};

export const deleteCourseApi = async (id: number): Promise<void> => {
  await client.delete(`/courses/${id}`);
};

export const getTeachersForDropdownApi = async (): Promise<{ teacherId: number; teacherCode: string; fullName: string }[]> => {
  const response = await client.get<ApiResponse<{ users: TeacherUser[] }>>('/users?role=teacher&size=100');
  return response.data.data.users.map((u: TeacherUser) => ({
    teacherId: u.profile?.teacherId,
    teacherCode: u.profile?.teacherCode,
    fullName: u.profile?.fullName || u.username,
  }));
};