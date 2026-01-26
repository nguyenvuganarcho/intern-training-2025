import Joi from 'joi';

export const createFeedbackSchema = Joi.object({
  subject: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Subject is required',
    'string.max': 'Subject must not exceed 200 characters',
    'any.required': 'Subject is required',
  }),
  message: Joi.string().min(1).max(2000).required().messages({
    'string.empty': 'Message is required',
    'string.max': 'Message must not exceed 2000 characters',
    'any.required': 'Message is required',
  }),
});

export const updateFeedbackSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'reviewed', 'resolved')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, reviewed, resolved',
      'any.required': 'Status is required',
    }),
  response: Joi.string().max(2000).optional().allow('').messages({
    'string.max': 'Response must not exceed 2000 characters',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.string()
    .valid('pending', 'reviewed', 'resolved')
    .optional(),
  userId: Joi.number().integer().optional(),
});