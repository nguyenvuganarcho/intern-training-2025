import { Request, Response, NextFunction } from 'express';
import { ScheduleService } from './schedule.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import {
  createScheduleSchema,
  updateScheduleSchema,
  checkConflictSchema,
  paginationSchema,
} from './schedule.validation';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  CheckConflictDto,
  PaginationQuery,
} from './schedule.dto';

export class ScheduleController {
  private service: ScheduleService;

  constructor() {
    this.service = new ScheduleService();
  }

  // GET /api/schedules
  getAllSchedules = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.service.getAllSchedules(value as PaginationQuery);

      return res.status(200).json(
        ApiResponse.success('Schedules retrieved successfully', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/schedules
  createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createScheduleSchema.validate(req.body, {
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

      const schedule = await this.service.createSchedule(value as CreateScheduleDto);

      return res.status(201).json(
        ApiResponse.success('Schedule created successfully', schedule, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/schedules/:id
  updateSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scheduleId = parseInt(req.params.id as string, 10);

      if (isNaN(scheduleId)) {
        throw new ValidationError([
          { field: 'id', message: 'Schedule ID must be a valid number' },
        ]);
      }

      const { error, value } = updateScheduleSchema.validate(req.body, {
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

      const schedule = await this.service.updateSchedule(scheduleId, value as UpdateScheduleDto);

      return res.status(200).json(
        ApiResponse.success('Schedule updated successfully', schedule, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/schedules/:id
  deleteSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scheduleId = parseInt(req.params.id as string, 10);

      if (isNaN(scheduleId)) {
        throw new ValidationError([
          { field: 'id', message: 'Schedule ID must be a valid number' },
        ]);
      }

      await this.service.deleteSchedule(scheduleId);

      return res.status(200).json(
        ApiResponse.success('Schedule deleted successfully', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/schedules/check-conflict
  checkConflict = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = checkConflictSchema.validate(req.body, {
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

      const result = await this.service.checkConflict(value as CheckConflictDto);

      return res.status(200).json(
        ApiResponse.success('Conflict check completed', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}