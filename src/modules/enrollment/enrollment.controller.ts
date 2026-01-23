import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import { createEnrollmentSchema, paginationSchema } from './enrollment.validation';
import { CreateEnrollmentDto, PaginationQuery } from './enrollment.dto';

export class EnrollmentController {
  private service: EnrollmentService;

  constructor() {
    this.service = new EnrollmentService();
  }

  // GET /api/enrollments
  getAllEnrollments = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllEnrollments(value as PaginationQuery);

      return res.status(200).json(
        ApiResponse.success('Enrollments retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/enrollments
  createEnrollment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createEnrollmentSchema.validate(req.body, {
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

      const enrollment = await this.service.createEnrollment(
        value as CreateEnrollmentDto,
        req.user?.userId,
        req.user?.role
      );

      return res.status(201).json(
        ApiResponse.success('Enrollment created successfully', enrollment, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/enrollments/:id
  deleteEnrollment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollId = parseInt(req.params.id as string, 10);

      if (isNaN(enrollId)) {
        throw new ValidationError([
          { field: 'id', message: 'Enrollment ID must be a valid number' },
        ]);
      }

      await this.service.deleteEnrollment(
        enrollId,
        req.user?.userId,
        req.user?.role
      );

      return res.status(200).json(
        ApiResponse.success('Enrollment dropped successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}