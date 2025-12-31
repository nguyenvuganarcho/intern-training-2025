import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import {
  createCourseSchema,
  updateCourseSchema,
  paginationSchema,
} from './course.validation';

export class CourseController {
  private service: CourseService;

  constructor() {
    this.service = new CourseService();
  }

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createCourseSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const course = await this.service.createCourse(value);

      return res
        .status(201)
        .json(
          ApiResponse.success('Course created successfully', course, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
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

      const { page, size, search } = value;

      const result = await this.service.getAllCourses(
        page,
        size,
        search || undefined
      );

      return res
        .status(200)
        .json(
          ApiResponse.success('Courses retrieved successfully', result, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      const course = await this.service.getCourseById(id);

      return res
        .status(200)
        .json(
          ApiResponse.success('Course retrieved successfully', course, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      const { error, value } = updateCourseSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const course = await this.service.updateCourse(id, value);

      return res
        .status(200)
        .json(
          ApiResponse.success('Course updated successfully', course, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      await this.service.deleteCourse(id);

      return res
        .status(200)
        .json(
          ApiResponse.success('Course deleted successfully', null, req.path)
        );
    } catch (err) {
      next(err);
    }
  };
}