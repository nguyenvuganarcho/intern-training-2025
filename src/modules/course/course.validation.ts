import Joi from 'joi';

export const createCourseSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 100 characters',
  }),
  duration: Joi.number().integer().min(10).max(200).required().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 10 hour',
    'number.max': 'Duration must not exceed 200 hours',
  }),
});

export const updateCourseSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  duration: Joi.number().integer().min(1).max(1000).optional(),
}).min(1);

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
});