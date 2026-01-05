import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';

export class StudentController {
  private service: StudentService;

  constructor() {
    this.service = new StudentService();
  }

  createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await this.service.createStudent(req.body);
      return res.status(201).json(
        ApiResponse.success('Student created successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const students = await this.service.getAllStudents();
      return res.status(200).json(
        ApiResponse.success('Students retrieved successfully', students, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await this.service.getStudentById(Number(req.params.id));
      return res.status(200).json(
        ApiResponse.success('Student retrieved successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  }

  updateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        throw new ValidationError([
          { field: 'id', message: 'ID must be a valid number' },
        ]);
      }

      const student = await this.service.updateStudent(id, req.body);
      return res.status(200).json(
        ApiResponse.success('Student updated successfully', student, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE - DELETE /students/:id
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