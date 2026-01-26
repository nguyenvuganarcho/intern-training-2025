import Joi from 'joi';

export const createNotificationSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    'number.base': 'User ID must be a number',
    'any.required': 'User ID is required',
  }),
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Message is required',
    'string.max': 'Message must not exceed 1000 characters',
    'any.required': 'Message is required',
  }),
  type: Joi.string()
    .valid('enrollment', 'grade', 'schedule', 'announcement', 'system')
    .required()
    .messages({
      'any.only': 'Type must be one of: enrollment, grade, schedule, announcement, system',
      'any.required': 'Type is required',
    }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  isRead: Joi.boolean().optional(),
  type: Joi.string()
    .valid('enrollment', 'grade', 'schedule', 'announcement', 'system')
    .optional(),
  userId: Joi.number().integer().optional(),
});