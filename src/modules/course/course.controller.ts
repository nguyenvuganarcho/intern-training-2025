import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import {
  createCourseSchema,
  updateCourseSchema,
  paginationSchema,
} from './course.validation';
import { CreateCourseDto, UpdateCourseDto, PaginationQuery } from './course.dto';

export class CourseController {
  private service: CourseService;

  constructor() {
    this.service = new CourseService();
  }

  // GET /api/courses
  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = paginationSchema.validate(req.query);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join('.') : String(d.path),
            message: d.message,
          }))
        );
      }

      const result = await this.service.getAllCourses(value as PaginationQuery);

      return res.status(200).json(
        ApiResponse.success('Courses retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/courses/:id
  getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string, 10);

      if (isNaN(courseId)) {
        throw new ValidationError([
          { field: 'id', message: 'Course ID must be a valid number' },
        ]);
      }

      const course = await this.service.getCourseById(courseId);

      return res.status(200).json(
        ApiResponse.success('Course retrieved successfully', course, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/courses
  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createCourseSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join('.') : String(d.path),
            message: d.message,
          }))
        );
      }

      const course = await this.service.createCourse(value as CreateCourseDto);

      return res.status(201).json(
        ApiResponse.success('Course created successfully', course, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/courses/:id
  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string, 10);

      if (isNaN(courseId)) {
        throw new ValidationError([
          { field: 'id', message: 'Course ID must be a valid number' },
        ]);
      }

      const { error, value } = updateCourseSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join('.') : String(d.path),
            message: d.message,
          }))
        );
      }

      const course = await this.service.updateCourse(courseId, value as UpdateCourseDto);

      return res.status(200).json(
        ApiResponse.success('Course updated successfully', course, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/courses/:id
  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string, 10);

      if (isNaN(courseId)) {
        throw new ValidationError([
          { field: 'id', message: 'Course ID must be a valid number' },
        ]); 
      }

      await this.service.deleteCourse(courseId);

      return res.status(200).json(
        ApiResponse.success('Course deleted successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/courses/available
  getAvailableCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string, 10) : undefined;

      if (studentId && isNaN(studentId)) {
        throw new ValidationError([
          { field: 'studentId', message: 'Student ID must be a valid number' },
        ]);
      }

      const courses = await this.service.getAvailableCourses(studentId);

      return res.status(200).json(
        ApiResponse.success('Available courses retrieved successfully', courses, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/courses/:id/classes
  getCourseClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string, 10);

      if (isNaN(courseId)) {
        throw new ValidationError([
          { field: 'id', message: 'Course ID must be a valid number' },
        ]);
      }

      const classes = await this.service.getCourseClasses(courseId);

      return res.status(200).json(
        ApiResponse.success('Course classes retrieved successfully', classes, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}