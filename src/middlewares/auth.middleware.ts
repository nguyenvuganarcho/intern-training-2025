import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../common/apiResponse';

// Extend Express Request type để có req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json(
        ApiResponse.fail('No token provided', 'UNAUTHORIZED', req.path)
      );
    }

    // 2. Check format: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json(
        ApiResponse.fail('Invalid token format', 'UNAUTHORIZED', req.path)
      );
    }

    const token = parts[1];

    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 4. Attach user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    // 5. Continue to next middleware/controller
    next();
  } catch (error: any) {
    // Handle specific JWT errors
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

// Optional: Role-based middleware
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