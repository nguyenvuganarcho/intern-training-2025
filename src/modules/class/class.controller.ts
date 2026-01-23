import { Request, Response, NextFunction } from 'express';
import { ClassService } from './class.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import {
  createClassSchema,
  updateClassSchema,
  paginationSchema,
} from './class.validation';
import { CreateClassDto, UpdateClassDto, PaginationQuery } from './class.dto';

export class ClassController {
  private service: ClassService;

  constructor() {
    this.service = new ClassService();
  }

  // GET /api/classes
  getAllClasses = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllClasses(value as PaginationQuery);

      return res.status(200).json(
        ApiResponse.success('Classes retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/classes/:id
  getClassById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params.id as string, 10);

      if (isNaN(classId)) {
        throw new ValidationError([
          { field: 'id', message: 'Class ID must be a valid number' },
        ]);
      }

      const classData = await this.service.getClassById(classId);

      return res.status(200).json(
        ApiResponse.success('Class retrieved successfully', classData, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/classes
  createClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createClassSchema.validate(req.body, {
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

      const classData = await this.service.createClass(value as CreateClassDto);

      return res.status(201).json(
        ApiResponse.success('Class created successfully', classData, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/classes/:id
  updateClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params.id as string, 10);

      if (isNaN(classId)) {
        throw new ValidationError([
          { field: 'id', message: 'Class ID must be a valid number' },
        ]);
      }

      const { error, value } = updateClassSchema.validate(req.body, {
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

      const classData = await this.service.updateClass(classId, value as UpdateClassDto);

      return res.status(200).json(
        ApiResponse.success('Class updated successfully', classData, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/classes/:id
  deleteClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params.id as string, 10);

      if (isNaN(classId)) {
        throw new ValidationError([
          { field: 'id', message: 'Class ID must be a valid number' },
        ]);
      }

      await this.service.deleteClass(classId);

      return res.status(200).json(
        ApiResponse.success('Class deleted successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/classes/:id/students
  getClassStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params.id as string
        
        , 10);

      if (isNaN(classId)) {
        throw new ValidationError([
          { field: 'id', message: 'Class ID must be a valid number' },
        ]);
      }

      const students = await this.service.getClassStudents(classId);

      return res.status(200).json(
        ApiResponse.success('Class students retrieved successfully', students, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}