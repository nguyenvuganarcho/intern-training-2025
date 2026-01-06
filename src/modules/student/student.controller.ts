import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import { createStudentSchema, updateStudentSchema, paginationSchema } from './student.validation';

export class StudentController {
  private service: StudentService;

  constructor() {
    this.service = new StudentService();
  }

  createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createStudentSchema.validate(req.body, {
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

      const student = await this.service.createStudent(value);
      return res.status(201).json(
        ApiResponse.success('Student created successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllStudents(page, size, search || undefined);

      return res.status(200).json(
        ApiResponse.success('Students retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      const student = await this.service.getStudentById(id);
      return res.status(200).json(
        ApiResponse.success('Student retrieved successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  updateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      const { error, value } = updateStudentSchema.validate(req.body, {
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

      const student = await this.service.updateStudent(id, value);
      return res.status(200).json(
        ApiResponse.success('Student updated successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      await this.service.deleteStudent(id);
      return res.status(200).json(
        ApiResponse.success('Student deleted successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}