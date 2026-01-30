import client from './client';
import type { Grade, UpdateGradeDto, ApiResponse } from '../types';

// Update grade (Teacher only)
export const updateGradeApi = async (enrollId: number, data: UpdateGradeDto): Promise<Grade> => {
  const response = await client.put<ApiResponse<Grade>>(`/grades/${enrollId}`, data);
  return response.data.data;
};

// Get grade by enrollId
export const getGradeApi = async (enrollId: number): Promise<Grade> => {
  const response = await client.get<ApiResponse<Grade>>(`/grades/${enrollId}`);
  return response.data.data;
};