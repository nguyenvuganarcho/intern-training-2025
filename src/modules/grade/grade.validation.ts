import Joi from 'joi';

export const createGradeSchema = Joi.object({
  enrollId: Joi.number().integer().required().messages({
    'number.base': 'Enrollment ID must be a number',
    'any.required': 'Enrollment ID is required',
  }),
  finalScore: Joi.number().min(0).max(10).precision(2).required().messages({
    'number.base': 'Final score must be a number',
    'number.min': 'Final score must be between 0 and 10',
    'number.max': 'Final score must be between 0 and 10',
    'any.required': 'Final score is required',
  }),
});

export const updateGradeSchema = Joi.object({
  finalScore: Joi.number().min(0).max(10).precision(2).required().messages({
    'number.base': 'Final score must be a number',
    'number.min': 'Final score must be between 0 and 10',
    'number.max': 'Final score must be between 0 and 10',
    'any.required': 'Final score is required',
  }),
});

export const bulkCreateGradeSchema = Joi.object({
  grades: Joi.array()
    .items(
      Joi.object({
        enrollId: Joi.number().integer().required(),
        finalScore: Joi.number().min(0).max(10).precision(2).required(),
      })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one grade is required',
      'array.max': 'Cannot create more than 100 grades at once',
      'any.required': 'Grades array is required',
    }),
});