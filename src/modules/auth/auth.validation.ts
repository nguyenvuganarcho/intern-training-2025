import Joi from "joi";
import { UserRole } from "./auth.dto";

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(100).required().messages({
    "string.empty": "Username is required",
    "string.alphanum": "Username must only contain alphanumeric characters",
    "string.min": "Username must be at least 4 characters",
    "string.max": "Username must not exceed 100 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),

  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 100 characters",
  }),

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .default(UserRole.USER)
    .messages({
      "any.only": "Role must be USER or ADMIN",
    }),
});

export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'string.empty': 'Username is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});
