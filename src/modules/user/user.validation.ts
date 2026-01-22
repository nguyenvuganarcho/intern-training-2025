import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(50).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 4 characters',
    'string.alphanum': 'Username must be alphanumeric',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be valid',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  role: Joi.string().valid('admin', 'student', 'teacher').required().messages({
    'any.only': 'Role must be admin, student, or teacher',
  }),
  fullName: Joi.string().min(3).max(100).optional(),
  dateOfBirth: Joi.date().iso().optional(),
  phone: Joi.string().max(15).optional(),
  address: Joi.string().max(100).optional(),
  studentCode: Joi.when('role', {
    is: 'student',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  teacherCode: Joi.when('role', {
    is: 'teacher',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  fullName: Joi.string().min(3).max(100).optional(),
  dateOfBirth: Joi.date().iso().optional(),
  phone: Joi.string().max(15).optional(),
  address: Joi.string().max(100).optional(),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  size: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  role: Joi.string().valid('admin', 'student', 'teacher').optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
});