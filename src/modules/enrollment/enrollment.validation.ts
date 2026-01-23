import Joi from 'joi';

export const createEnrollmentSchema = Joi.object({
  studentId: Joi.number().integer().required().messages({
    'number.base': 'Student ID must be a number',
    'any.required': 'Student ID is required',
  }),
  courseId: Joi.number().integer().required().messages({
    'number.base': 'Course ID must be a number',
    'any.required': 'Course ID is required',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  studentId: Joi.number().integer().optional(),
  courseId: Joi.number().integer().optional(),
  teacherId: Joi.number().integer().optional(),
  status: Joi.string().valid('enrolled', 'dropped').optional(),
});