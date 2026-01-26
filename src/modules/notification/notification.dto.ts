export interface NotificationDto {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: 'enrollment' | 'grade' | 'schedule' | 'announcement' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  type: 'enrollment' | 'grade' | 'schedule' | 'announcement' | 'system';
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  isRead?: boolean;
  type?: string;
  userId?: number;
}