import Joi from 'joi';

export const updateTeacherProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  dateOfBirth: Joi.date().iso().optional(),
  phone: Joi.string().max(15).optional().allow(''),
  address: Joi.string().max(100).optional().allow(''),
}).min(1);

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  status: Joi.string().valid('active', 'inactive').optional(),
});