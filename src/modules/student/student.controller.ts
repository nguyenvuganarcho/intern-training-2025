import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import { updateStudentProfileSchema, paginationSchema } from './student.validation';
import { UpdateStudentProfileDto, PaginationQuery } from './student.dto';

export class StudentController {
  private service: StudentService;

  constructor() {
    this.service = new StudentService();
  }

  // GET /api/students
  getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllStudents(value as PaginationQuery);

      return res.status(200).json(
        ApiResponse.success('Students retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/students/:id
  getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id as string, 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      const student = await this.service.getStudentById(studentId);

      return res.status(200).json(
        ApiResponse.success('Student retrieved successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/students/:id
  updateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id as string, 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      const { error, value } = updateStudentProfileSchema.validate(req.body, {
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

      const student = await this.service.updateStudent(studentId, value as UpdateStudentProfileDto);

      return res.status(200).json(
        ApiResponse.success('Student updated successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/students/:id
  deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id as string, 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      await this.service.deleteStudent(studentId);

      return res.status(200).json(
        ApiResponse.success('Student deleted successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/students/:id/grades
  getStudentGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id as string, 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      const grades = await this.service.getStudentGrades(studentId);

      return res.status(200).json(
        ApiResponse.success('Student grades retrieved successfully', grades, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /api/students/:id/schedule
  getStudentSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id as string    , 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      const schedule = await this.service.getStudentSchedule(studentId);

      return res.status(200).json(
        ApiResponse.success('Student schedule retrieved successfully', schedule, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}