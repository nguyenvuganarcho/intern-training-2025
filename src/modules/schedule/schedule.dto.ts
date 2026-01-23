export interface ScheduleDto {
  scheduleId: number;
  classId: number;
  className: string;
  courseCode: string;
  courseName: string;
  teacherId: number;
  teacherName: string;
  dayOfTheWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  createdAt: string;
}

export interface CreateScheduleDto {
  classId: number;
  dayOfTheWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // Format: "HH:MM:SS"
  endTime: string;   // Format: "HH:MM:SS"
  room: string;
}

export interface UpdateScheduleDto {
  dayOfTheWeek?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime?: string;
  endTime?: string;
  room?: string;
}

export interface CheckConflictDto {
  classId: number;
  dayOfTheWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  excludeScheduleId?: number;
}

export interface ConflictResultDto {
  hasConflict: boolean;
  conflicts: ConflictDetailDto[];
}

export interface ConflictDetailDto {
  type: 'room' | 'teacher';
  scheduleId: number;
  className: string;
  courseCode: string;
  courseName: string;
  teacherName: string;
  dayOfTheWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  message: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
  classId?: number;
  teacherId?: number;
  dayOfTheWeek?: string;
  room?: string;
}