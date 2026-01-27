import client from './client';
import type { LoginRequest, LoginResponse } from '../types';

// Login API
export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

// Logout API
export const logoutApi = async (): Promise<void> => {
  await client.post('/auth/logout');
};

// Get current user (optional - nếu có endpoint này)
export const getCurrentUser = async () => {
  const response = await client.get('/auth/me');
  return response.data;
};