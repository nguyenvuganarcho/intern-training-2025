import Joi from 'joi';

export const createNewsSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  content: Joi.string().min(1).required().messages({
    'string.empty': 'Content is required',
    'any.required': 'Content is required',
  }),
});

export const updateNewsSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  content: Joi.string().min(1).required().messages({
    'string.empty': 'Content is required',
    'any.required': 'Content is required',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
});