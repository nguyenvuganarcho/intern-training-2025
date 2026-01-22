import Joi from 'joi';

export const createCourseSchema = Joi.object({
  courseCode: Joi.string().min(2).max(20).required().messages({
    'string.empty': 'Course code is required',
    'string.min': 'Course code must be at least 2 characters',
  }),
  courseName: Joi.string().min(3).max(150).required().messages({
    'string.empty': 'Course name is required',
    'string.min': 'Course name must be at least 3 characters',
  }),
  credits: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'Credits must be a number',
    'number.min': 'Credits must be at least 1',
    'number.max': 'Credits must not exceed 10',
  }),
  teacherId: Joi.number().integer().required().messages({
    'number.base': 'Teacher ID must be a number',
    'any.required': 'Teacher ID is required',
  }),
});

export const updateCourseSchema = Joi.object({
  courseName: Joi.string().min(3).max(150).optional(),
  credits: Joi.number().integer().min(1).max(10).optional(),
  teacherId: Joi.number().integer().optional(),
}).min(1);

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  teacherId: Joi.number().integer().optional(),
  minCredits: Joi.number().integer().min(1).max(10).optional(),
  maxCredits: Joi.number().integer().min(1).max(10).optional(),
});