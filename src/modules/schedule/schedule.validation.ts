import Joi from 'joi';

const dayOfWeekEnum = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

export const createScheduleSchema = Joi.object({
  classId: Joi.number().integer().required().messages({
    'number.base': 'Class ID must be a number',
    'any.required': 'Class ID is required',
  }),
  dayOfTheWeek: Joi.string().valid(...dayOfWeekEnum).required().messages({
    'any.only': 'Day of week must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
    'any.required': 'Day of week is required',
  }),
  startTime: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'Start time must be in format HH:MM:SS (e.g., 08:00:00)',
    'any.required': 'Start time is required',
  }),
  endTime: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'End time must be in format HH:MM:SS (e.g., 10:00:00)',
    'any.required': 'End time is required',
  }),
  room: Joi.string().min(1).max(20).required().messages({
    'string.empty': 'Room is required',
    'string.max': 'Room must not exceed 20 characters',
  }),
});

export const updateScheduleSchema = Joi.object({
  dayOfTheWeek: Joi.string().valid(...dayOfWeekEnum).optional(),
  startTime: Joi.string().pattern(timeRegex).optional(),
  endTime: Joi.string().pattern(timeRegex).optional(),
  room: Joi.string().min(1).max(20).optional(),
}).min(1);

export const checkConflictSchema = Joi.object({
  classId: Joi.number().integer().required(),
  dayOfTheWeek: Joi.string().valid(...dayOfWeekEnum).required(),
  startTime: Joi.string().pattern(timeRegex).required(),
  endTime: Joi.string().pattern(timeRegex).required(),
  room: Joi.string().min(1).max(20).required(),
  excludeScheduleId: Joi.number().integer().optional(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  classId: Joi.number().integer().optional(),
  teacherId: Joi.number().integer().optional(),
  dayOfTheWeek: Joi.string().valid(...dayOfWeekEnum).optional(),
  room: Joi.string().optional(),
});