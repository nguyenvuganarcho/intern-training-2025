import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../common/apiResponse";

export class UserController {
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        role: req.user!.role,
      };

      return res
        .status(200)
        .json(
          ApiResponse.success(
            "User profile retrieved successfully",
            user,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };
}
