import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../common/apiResponse';
import { ValidationError } from '../../common/errors';
import {
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  confirmResetPasswordSchema,
} from './auth.validation';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  // POST /api/auth/login
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

      const result = await this.service.login(value);

      return res.status(200).json(
        ApiResponse.success('Login successful', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/auth/refresh-token
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = refreshTokenSchema.validate(req.body, {
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

      const result = await this.service.refreshToken(value);

      return res.status(200).json(
        ApiResponse.success('Token refreshed', result, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/auth/logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError([
          { field: 'refreshToken', message: 'Refresh token is required' },
        ]);
      }

      await this.service.logout(refreshToken);

      return res.status(200).json(
        ApiResponse.success('Logout successful', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/auth/reset-password
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = resetPasswordSchema.validate(req.body, {
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

      await this.service.resetPasswordRequest(value);

      return res.status(200).json(
        ApiResponse.success(
          'If email exists, reset instructions have been sent',
          null,
          req.path
        )
      );
    } catch (err) {
      next(err);
    }
  };

  // POST /api/auth/confirm-reset-password
  confirmResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = confirmResetPasswordSchema.validate(req.body, {
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

      await this.service.confirmResetPassword(value);

      return res.status(200).json(
        ApiResponse.success('Password reset successful', null, req.path)
      );
    } catch (err) {
      next(err);
    }
  };
}