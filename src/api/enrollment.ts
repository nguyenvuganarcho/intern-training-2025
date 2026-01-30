import client from './client';
import type { Enrollment, CreateEnrollmentDto, EnrollmentListResponse, ApiResponse } from '../types';

// Get enrollments (with filters)
export const getEnrollmentsApi = async (
  page: number = 1,
  size: number = 100,
  studentId?: number,
  status: 'enrolled' | 'dropped' = 'enrolled'
): Promise<EnrollmentListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    status,
  });

  if (studentId) {
    params.append('studentId', studentId.toString());
  }

  const response = await client.get<ApiResponse<EnrollmentListResponse>>(`/enrollments?${params.toString()}`);
  return response.data.data;
};

// Create enrollment (enroll course)
export const enrollCourseApi = async (data: CreateEnrollmentDto): Promise<Enrollment> => {
  const response = await client.post<ApiResponse<Enrollment>>('/enrollments', data);
  return response.data.data;
};

// Delete enrollment (drop course)
export const dropEnrollmentApi = async (enrollId: number): Promise<void> => {
  await client.delete(`/enrollments/${enrollId}`);
};

// Select class for enrollment
export const selectClassApi = async (enrollId: number, classId: number): Promise<Enrollment> => {
  const response = await client.put<ApiResponse<Enrollment>>(`/enrollments/${enrollId}/class`, { classId });
  return response.data.data;
};