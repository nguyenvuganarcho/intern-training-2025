import client from './client';
import type { Student, CreateStudentDto, UpdateStudentDto, StudentListResponse, ApiResponse } from '../types';

// Get all students with pagination
export const getStudentsApi = async (
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<StudentListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await client.get<ApiResponse<StudentListResponse>>(`/students?${params.toString()}`);
  return response.data.data;
};

export const getStudentByIdApi = async (id: number): Promise<Student> => {
  const response = await client.get<ApiResponse<Student>>(`/students/${id}`);
  return response.data.data;
};

export const createStudentApi = async (data: CreateStudentDto): Promise<Student> => {
  const response = await client.post<ApiResponse<Student>>('/students', data);
  return response.data.data;
};

export const updateStudentApi = async (id: number, data: UpdateStudentDto): Promise<Student> => {
  const response = await client.put<ApiResponse<Student>>(`/students/${id}`, data);
  return response.data.data;
};


export const deleteStudentApi = async (id: number): Promise<void> => {
  await client.delete(`/students/${id}`);
};