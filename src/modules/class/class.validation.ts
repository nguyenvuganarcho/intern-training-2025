import Joi from 'joi';

export const createClassSchema = Joi.object({
  className: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Class name is required',
    'string.min': 'Class name must be at least 2 characters',
  }),
  courseId: Joi.number().integer().required().messages({
    'number.base': 'Course ID must be a number',
    'any.required': 'Course ID is required',
  }),
});

export const updateClassSchema = Joi.object({
  className: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Class name is required',
    'string.min': 'Class name must be at least 2 characters',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  courseId: Joi.number().integer().optional(),
  teacherId: Joi.number().integer().optional(),
});