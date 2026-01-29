import client from './client';
import type { ChangePasswordDto } from '../types';

export const changePasswordApi = async (userId: number, data: ChangePasswordDto): Promise<void> => {
  await client.put(`/users/${userId}/password`, data);
};