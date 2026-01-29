import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { ApiResponse } from "../../common/apiResponse";
import { ValidationError } from "../../common/errors";
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  paginationSchema,
} from "./user.validation";
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  PaginationQuery,
} from "./user.dto";

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = paginationSchema.validate(req.query);

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join(".") : String(d.path),
            message: d.message,
          })),
        );
      }

      const result = await this.service.getAllUsers(value as PaginationQuery);

      return res
        .status(200)
        .json(
          ApiResponse.success("Users retrieved successfully", result, req.path),
        );
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id as string, 10);

      if (isNaN(userId)) {
        throw new ValidationError([
          { field: "id", message: "User ID must be a valid number" },
        ]);
      }

      const user = await this.service.getUserById(userId);

      return res
        .status(200)
        .json(
          ApiResponse.success("User retrieved successfully", user, req.path),
        );
    } catch (err) {
      next(err);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createUserSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join(".") : String(d.path),
            message: d.message,
          })),
        );
      }

      const user = await this.service.createUser(value as CreateUserDto);

      return res
        .status(201)
        .json(ApiResponse.success("User created successfully", user, req.path));
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id as string, 10);

      if (isNaN(userId)) {
        throw new ValidationError([
          { field: "id", message: "User ID must be a valid number" },
        ]);
      }

      const { error, value } = updateUserSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join(".") : String(d.path),
            message: d.message,
          })),
        );
      }

      const user = await this.service.updateUser(
        userId,
        value as UpdateUserDto,
      );

      return res
        .status(200)
        .json(ApiResponse.success("User updated successfully", user, req.path));
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id as string, 10);

      if (isNaN(userId)) {
        throw new ValidationError([
          { field: "id", message: "User ID must be a valid number" },
        ]);
      }

      await this.service.deleteUser(userId);

      return res
        .status(200)
        .json(ApiResponse.success("User deleted successfully", null, req.path));
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id as string, 10);

      if (isNaN(userId)) {
        throw new ValidationError([
          { field: "id", message: "User ID must be a valid number" },
        ]);
      }

      const { error, value } = changePasswordSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((d) => ({
            field: Array.isArray(d.path) ? d.path.join(".") : String(d.path),
            message: d.message,
          })),
        );
      }

      await this.service.changePassword(userId, value as ChangePasswordDto);

      return res
        .status(200)
        .json(
          ApiResponse.success("Password changed successfully", null, req.path),
        );
    } catch (err) {
      next(err);
    }
  };
}
