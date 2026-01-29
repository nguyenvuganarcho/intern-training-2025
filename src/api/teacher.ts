import client from './client';
import type { Teacher, CreateTeacherDto, UpdateTeacherDto, TeacherListResponse, ApiResponse } from '../types';

// Get all teachers with pagination
export const getTeachersApi = async (
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<TeacherListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await client.get<ApiResponse<TeacherListResponse>>(`/teachers?${params.toString()}`);
  return response.data.data;
};

export const getTeacherByIdApi = async (id: number): Promise<Teacher> => {
  const response = await client.get<ApiResponse<Teacher>>(`/teachers/${id}`);
  return response.data.data;
};

export const createTeacherApi = async (data: CreateTeacherDto): Promise<Teacher> => {
  const response = await client.post<ApiResponse<Teacher>>('/teachers', data);
  return response.data.data;
};

export const updateTeacherApi = async (id: number, data: UpdateTeacherDto): Promise<Teacher> => {
  const response = await client.put<ApiResponse<Teacher>>(`/teachers/${id}`, data);
  return response.data.data;
};

export const deleteTeacherApi = async (id: number): Promise<void> => {
  await client.delete(`/teachers/${id}`);
};