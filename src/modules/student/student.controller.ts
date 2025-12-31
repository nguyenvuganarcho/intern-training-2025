import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { ApiResponse } from '../../common/apiResponse';

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
}