import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../common/apiResponse';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json(
        ApiResponse.fail('No token provided', 'UNAUTHORIZED', req.path)
      );
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json(
        ApiResponse.fail('Invalid token format', 'UNAUTHORIZED', req.path)
      );
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        ApiResponse.fail('Token expired', 'TOKEN_EXPIRED', req.path)
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        ApiResponse.fail('Invalid token', 'INVALID_TOKEN', req.path)
      );
    }

    return res.status(401).json(
      ApiResponse.fail('Authentication failed', 'UNAUTHORIZED', req.path)
    );
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        ApiResponse.fail('Authentication required', 'UNAUTHORIZED', req.path)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.fail('Insufficient permissions', 'FORBIDDEN', req.path)
      );
    }

    next();
  };
};