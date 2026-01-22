import { Request, Response, NextFunction } from 'express';
import { TeacherService } from './teacher.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import { updateTeacherProfileSchema, paginationSchema } from './teacher.validation';
import { UpdateTeacherProfileDto, PaginationQuery } from './teacher.dto';

export class TeacherController {
  private service: TeacherService;

  constructor() {
    this.service = new TeacherService();
  }

  // GET /api/teachers
  getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllTeachers(value as PaginationQuery);

      return res.status(200).json(
        ApiResponse.success('Teachers retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/teachers/:id
  getTeacherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = parseInt(req.params.id as string, 10);

      if (isNaN(teacherId)) {
        throw new ValidationError([
          { field: 'id', message: 'Teacher ID must be a valid number' },
        ]);
      }

      const teacher = await this.service.getTeacherById(teacherId);

      return res.status(200).json(
        ApiResponse.success('Teacher retrieved successfully', teacher, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/teachers/:id
  updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = parseInt(req.params.id as string, 10);

      if (isNaN(teacherId)) {
        throw new ValidationError([
          { field: 'id', message: 'Teacher ID must be a valid number' },
        ]);
      }

      const { error, value } = updateTeacherProfileSchema.validate(req.body, {
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

      const teacher = await this.service.updateTeacher(teacherId, value as UpdateTeacherProfileDto);

      return res.status(200).json(
        ApiResponse.success('Teacher updated successfully', teacher, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/teachers/:id
  deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = parseInt(req.params.id as string, 10);

      if (isNaN(teacherId)) {
        throw new ValidationError([
          { field: 'id', message: 'Teacher ID must be a valid number' },
        ]);
      }

      await this.service.deleteTeacher(teacherId);

      return res.status(200).json(
        ApiResponse.success('Teacher deleted successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/teachers/:id/courses
  getTeacherCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = parseInt(req.params.id as string, 10);

      if (isNaN(teacherId)) {
        throw new ValidationError([
          { field: 'id', message: 'Teacher ID must be a valid number' },
        ]);
      }

      const courses = await this.service.getTeacherCourses(teacherId);

      return res.status(200).json(
        ApiResponse.success('Teacher courses retrieved successfully', courses, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}