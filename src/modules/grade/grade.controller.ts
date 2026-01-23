import { Request, Response, NextFunction } from 'express';
import { GradeService } from './grade.service';
import {
  createGradeSchema,
  updateGradeSchema,
  bulkCreateGradeSchema,
} from './grade.validation';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';

export class GradeController {
  private service: GradeService;

  constructor() {
    this.service = new GradeService();
  }

  createGrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createGradeSchema.validate(req.body);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const grade = await this.service.createGrade(value, userId, userRole);

      res
        .status(201)
        .json(
          ApiResponse.success('Grade created successfully', grade, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  bulkCreateGrades = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = bulkCreateGradeSchema.validate(req.body);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const grades = await this.service.bulkCreateGrades(
        value,
        userId,
        userRole
      );

      res
        .status(201)
        .json(
          ApiResponse.success(
            'Grades created successfully',
             { 
              grades,
              total: grades.length,
              message: `Successfully created ${grades.length} grade(s)`
            },
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };

  updateGrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gradeId = parseInt(req.params.id as string, 10);

      if (isNaN(gradeId)) {
        throw new ValidationError([
          { field: 'id', message: 'Grade ID must be a number' },
        ]);
      }

      const { error, value } = updateGradeSchema.validate(req.body);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const grade = await this.service.updateGrade(
        gradeId,
        value,
        userId,
        userRole
      );

      res
        .status(200)
        .json(
          ApiResponse.success('Grade updated successfully', grade, req.path)
        );
    } catch (err) {
      next(err);
    }
  };
}