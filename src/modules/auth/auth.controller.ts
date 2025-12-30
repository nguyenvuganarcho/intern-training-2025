import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import { registerSchema, loginSchema } from './auth.validation';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = registerSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }
      
      const user = await this.service.register(value);

      return res
        .status(201)
        .json(
          ApiResponse.success('User registered successfully', user, req.path)
        );
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = loginSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      const authData = await this.service.login(value);

      return res
        .status(200)
        .json(
          ApiResponse.success('Login successful', authData, req.path)
        );
    } catch (err) {
      next(err);
    }
  };
}