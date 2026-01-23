import { ScheduleRepository } from './schedule.repo';
import { ClassRepository } from '../class/class.repo';
import {
  ScheduleDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  CheckConflictDto,
  ConflictResultDto,
  ConflictDetailDto,
  PaginationQuery,
} from './schedule.dto';
import { NotFoundError, ValidationError } from '../../common/errors';

export class ScheduleService {
  private repo: ScheduleRepository;
  private classRepo: ClassRepository;

  constructor() {
    this.repo = new ScheduleRepository();
    this.classRepo = new ClassRepository();
  }

  private toScheduleDto(schedule: any): ScheduleDto {
    return {
      scheduleId: schedule.scheduleId,
      classId: schedule.classId,
      className: schedule.className,
      courseCode: schedule.courseCode,
      courseName: schedule.courseName,
      teacherId: schedule.teacherId,
      teacherName: schedule.teacherName,
      dayOfTheWeek: schedule.dayOfTheWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      createdAt: schedule.createdAt.toISOString(),
    };
  }

  private toConflictDto(conflict: any): ConflictDetailDto {
    const type = conflict.conflictType;
    const message = type === 'room'
      ? `Room ${conflict.room} is already booked for ${conflict.className} (${conflict.courseCode})`
      : `Teacher ${conflict.teacherName} is teaching ${conflict.className} (${conflict.courseCode})`;

    return {
      type,
      scheduleId: conflict.scheduleId,
      className: conflict.className,
      courseCode: conflict.courseCode,
      courseName: conflict.courseName,
      teacherName: conflict.teacherName,
      dayOfTheWeek: conflict.dayOfTheWeek,
      startTime: conflict.startTime,
      endTime: conflict.endTime,
      room: conflict.room,
      message,
    };
  }

  private validateTime(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new ValidationError([
        { field: 'endTime', message: 'End time must be after start time' },
      ]);
    }
  }

  async createSchedule(createDto: CreateScheduleDto): Promise<ScheduleDto> {
    // 1. Validate time
    this.validateTime(createDto.startTime, createDto.endTime);

    // 2. Check class exists
    const classData = await this.classRepo.findById(createDto.classId);
    if (!classData) {
      throw new NotFoundError('Class');
    }

    // 3. Check conflicts
    const conflicts = await this.repo.checkConflicts(createDto);
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map((c) => this.toConflictDto(c));
      throw new ValidationError([
        {
          field: 'schedule',
          message: 'Schedule conflict detected',
          conflicts: conflictDetails,
        },
      ]);
    }

    // 4. Create schedule
    const schedule = await this.repo.create(createDto);

    // 5. Get full schedule info
    const fullSchedule = await this.repo.findById(schedule.scheduleId);

    return this.toScheduleDto(fullSchedule);
  }

  async getAllSchedules(
    query: PaginationQuery
  ): Promise<{
    schedules: ScheduleDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { schedules, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      schedules: schedules.map((s) => this.toScheduleDto(s)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getScheduleById(scheduleId: number): Promise<ScheduleDto> {
    const schedule = await this.repo.findById(scheduleId);

    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    return this.toScheduleDto(schedule);
  }

  async updateSchedule(scheduleId: number, updateDto: UpdateScheduleDto): Promise<ScheduleDto> {
    // 1. Check schedule exists
    const existing = await this.repo.findById(scheduleId);
    if (!existing) {
      throw new NotFoundError('Schedule');
    }

    // 2. Validate time if updating
    const startTime = updateDto.startTime || existing.startTime;
    const endTime = updateDto.endTime || existing.endTime;
    this.validateTime(startTime, endTime);

    // 3. Check conflicts
    const checkDto: CheckConflictDto = {
      classId: existing.classId,
      dayOfTheWeek: updateDto.dayOfTheWeek || existing.dayOfTheWeek,
      startTime,
      endTime,
      room: updateDto.room || existing.room,
      excludeScheduleId: scheduleId,
    };

    const conflicts = await this.repo.checkConflicts(checkDto);
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map((c) => this.toConflictDto(c));
      throw new ValidationError([
        {
          field: 'schedule',
          message: 'Schedule conflict detected',
          conflicts: conflictDetails,
        },
      ]);
    }

    // 4. Update schedule
    const updated = await this.repo.update(scheduleId, updateDto);

    return this.toScheduleDto(updated);
  }

  async deleteSchedule(scheduleId: number): Promise<void> {
    const deleted = await this.repo.delete(scheduleId);

    if (!deleted) {
      throw new NotFoundError('Schedule');
    }
  }

  async checkConflict(dto: CheckConflictDto): Promise<ConflictResultDto> {
    // Validate time
    this.validateTime(dto.startTime, dto.endTime);

    // Check class exists
    const classData = await this.classRepo.findById(dto.classId);
    if (!classData) {
      throw new NotFoundError('Class');
    }

    // Check conflicts
    const conflicts = await this.repo.checkConflicts(dto);

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map((c) => this.toConflictDto(c)),
    };
  }
}