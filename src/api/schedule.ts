import client from './client';
import type { Schedule, CreateScheduleDto, ScheduleListResponse, ApiResponse } from '../types';

// Get schedules with filters
export const getSchedulesApi = async (
  page: number = 1,
  size: number = 100,
  filters?: {
    classId?: number;
    teacherId?: number;
    dayOfTheWeek?: string;
    room?: string;
  }
): Promise<ScheduleListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters?.classId) {
    params.append('classId', filters.classId.toString());
  }
  if (filters?.teacherId) {
    params.append('teacherId', filters.teacherId.toString());
  }
  if (filters?.dayOfTheWeek) {
    params.append('dayOfTheWeek', filters.dayOfTheWeek);
  }
  if (filters?.room) {
    params.append('room', filters.room);
  }

  const response = await client.get<ApiResponse<ScheduleListResponse>>(`/schedules?${params.toString()}`);
  return response.data.data;
};

// Create schedule (Admin only)
export const createScheduleApi = async (data: CreateScheduleDto): Promise<Schedule> => {
  const response = await client.post<ApiResponse<Schedule>>('/schedules', data);
  return response.data.data;
};

// Update schedule (Admin only)
export const updateScheduleApi = async (id: number, data: Partial<CreateScheduleDto>): Promise<Schedule> => {
  const response = await client.put<ApiResponse<Schedule>>(`/schedules/${id}`, data);
  return response.data.data;
};

// Delete schedule (Admin only)
export const deleteScheduleApi = async (id: number): Promise<void> => {
  await client.delete(`/schedules/${id}`);
};