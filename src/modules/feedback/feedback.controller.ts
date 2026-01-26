import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from './feedback.service';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  paginationSchema,
} from './feedback.validation';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';

export class FeedbackController {
  private service: FeedbackService;

  constructor() {
    this.service = new FeedbackService();
  }

  createFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = createFeedbackSchema.validate(req.body);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const userId = (req as any).user.userId;

      const feedback = await this.service.createFeedback(value, userId);

      res
        .status(201)
        .json(
          ApiResponse.success(
            'Feedback created successfully',
            feedback,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };

  getAllFeedbacks = async (
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

      const result = await this.service.getAllFeedbacks(value, userId, userRole);

      res
        .status(200)
        .json(
          ApiResponse.success(
            'Feedbacks retrieved successfully',
            result,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };

  updateFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const feedbackId = parseInt(req.params.id as string, 10);

      if (isNaN(feedbackId)) {
        throw new ValidationError([
          { field: 'id', message: 'Feedback ID must be a number' },
        ]);
      }

      const { error, value } = updateFeedbackSchema.validate(req.body);

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

      const feedback = await this.service.updateFeedback(
        feedbackId,
        value,
        userId,
        userRole
      );

      res
        .status(200)
        .json(
          ApiResponse.success(
            'Feedback updated successfully',
            feedback,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };
}