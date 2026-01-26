import { NotificationRepository } from './notification.repo';
import {
  CreateNotificationDto,
  NotificationDto,
  PaginationQuery,
} from './notification.dto';
import { NotFoundError, ForbiddenError } from '../../common/errors';

export class NotificationService {
  private repo: NotificationRepository;

  constructor() {
    this.repo = new NotificationRepository();
  }

  private toDto(notification: any): NotificationDto {
    return {
      notificationId: notification.notificationId,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead === 1 || notification.isRead === true,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  async createNotification(
    createDto: CreateNotificationDto,
    requestUserId: number,
    userRole: string
  ): Promise<NotificationDto> {
    // Only admin can create notifications
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admin can create notifications');
    }

    const created = await this.repo.create(createDto);

    return this.toDto(created);
  }

  async getAllNotifications(
    query: PaginationQuery,
    userId: number,
    userRole: string
  ): Promise<{
    notifications: NotificationDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
    unreadCount: number;
  }> {
    // Users can only see their own notifications
    // Admin can see all if no userId filter is provided in query
    const targetUserId = userRole === 'admin' && query.userId ? query.userId : userId;

    const { notifications, total } = await this.repo.findAll(targetUserId, query);
    const unreadCount = await this.repo.getUnreadCount(targetUserId);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      notifications: notifications.map((n) => this.toDto(n)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
      unreadCount,
    };
  }

  async markAsRead(
    notificationId: number,
    userId: number,
    userRole: string
  ): Promise<NotificationDto> {
    const notification = await this.repo.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    // Users can only mark their own notifications as read
    if (userRole !== 'admin' && notification.userId !== userId) {
      throw new ForbiddenError('You can only mark your own notifications as read');
    }

    const updated = await this.repo.markAsRead(notificationId);

    return this.toDto(updated);
  }

  async markAllAsRead(userId: number): Promise<{ updated: number }> {
    const updated = await this.repo.markAllAsRead(userId);

    return { updated };
  }
}