import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import {
  createNotificationSchema,
  paginationSchema,
} from './notification.validation';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';

export class NotificationController {
  private service: NotificationService;

  constructor() {
    this.service = new NotificationService();
  }

  createNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = createNotificationSchema.validate(req.body);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const notification = await this.service.createNotification(
        value,
        userId,
        userRole
      );

      res
        .status(201)
        .json(
          ApiResponse.success(
            'Notification created successfully',
            notification,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };

  getAllNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = paginationSchema.validate(req.query);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const result = await this.service.getAllNotifications(
        value,
        userId,
        userRole
      );

      res
        .status(200)
        .json(
          ApiResponse.success(
            'Notifications retrieved successfully',
            result,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.id as string, 10);

      if (isNaN(notificationId)) {
        throw new ValidationError([
          { field: 'id', message: 'Notification ID must be a number' },
        ]);
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const notification = await this.service.markAsRead(
        notificationId,
        userId,
        userRole
      );

      res
        .status(200)
        .json(
          ApiResponse.success(
            'Notification marked as read',
            notification,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;

      const result = await this.service.markAllAsRead(userId);

      res
        .status(200)
        .json(
          ApiResponse.success(
            'All notifications marked as read',
            result,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };
}