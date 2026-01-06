import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';

export class EnrollmentController {
  private service: EnrollmentService;

  constructor() {
    this.service = new EnrollmentService();
  }

  // POST /students/:id/enroll
  enrollStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id, 10);
      const { courseId } = req.body;

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      if (!courseId || isNaN(parseInt(courseId, 10))) {
        throw new ValidationError([
          { field: 'courseId', message: 'Course ID is required and must be a number' },
        ]);
      }

      const enrollment = await this.service.enrollStudent(
        studentId,
        parseInt(courseId, 10)
      );

      return res.status(201).json(
        ApiResponse.success('Student enrolled successfully', enrollment, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // GET /students/:id/enrollments
  getStudentEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id, 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      const enrollments = await this.service.getStudentEnrollments(studentId);

      return res.status(200).json(
        ApiResponse.success('Student enrollments retrieved', enrollments, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /students/:id/enroll/:courseId
  unenrollStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params.id, 10);
      const courseId = parseInt(req.params.courseId, 10);

      if (isNaN(studentId)) {
        throw new ValidationError([
          { field: 'id', message: 'Student ID must be a valid number' },
        ]);
      }

      if (isNaN(courseId)) {
        throw new ValidationError([
          { field: 'courseId', message: 'Course ID must be a valid number' },
        ]);
      }

      await this.service.unenrollStudent(studentId, courseId);

      return res.status(200).json(
        ApiResponse.success('Student unenrolled successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}