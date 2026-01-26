import { Request, Response, NextFunction } from 'express';
import { NewsService } from './news.service';
import {
  createNewsSchema,
  updateNewsSchema,
  paginationSchema,
} from './news.validation';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';

export class NewsController {
  private service: NewsService;

  constructor() {
    this.service = new NewsService();
  }

  createNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createNewsSchema.validate(req.body);

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

      const news = await this.service.createNews(value, userId, userRole);

      res
        .status(201)
        .json(
          ApiResponse.success('News created successfully', news, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  getAllNews = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllNews(value);

      res
        .status(200)
        .json(
          ApiResponse.success( 'News retrieved successfully', result, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  getNewsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newsId = parseInt(req.params.id as string, 10); ;

      if (isNaN(newsId)) {
        throw new ValidationError([
          { field: 'id', message: 'News ID must be a number' },
        ]);
      }

      const news = await this.service.getNewsById(newsId);

      res
        .status(200)
        .json(
          ApiResponse.success( 'News retrieved successfully', news,req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  updateNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newsId = parseInt(req.params.id as string, 10);

      if (isNaN(newsId)) {
        throw new ValidationError([
          { field: 'id', message: 'News ID must be a number' },
        ]);
      }

      const { error, value } = updateNewsSchema.validate(req.body);

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

      const news = await this.service.updateNews(
        newsId,
        value,
        userId,
        userRole
      );

      res
        .status(200)
        .json(
          ApiResponse.success('News updated successfully', news, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  deleteNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newsId = parseInt(req.params.id as string, 10);

      if (isNaN(newsId)) {
        throw new ValidationError([
          { field: 'id', message: 'News ID must be a number' },
        ]);
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      await this.service.deleteNews(newsId, userId, userRole);

      res
        .status(200)
        .json(
          ApiResponse.success('News deleted successfully', null, req.path)
        );
    } catch (err) {
      next(err);
    }
  };
}