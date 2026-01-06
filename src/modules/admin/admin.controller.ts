import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../common/apiResponse";

export class AdminController {
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = {
        totalUsers: 100,
        totalCourses: 20,
        totalSudents: 80,
        totalEnrollments: 150,
        activeUsers: 50,
      };

      return res
        .status(200)
        .json(
          ApiResponse.success(
            "Admin stats retrieved successfully",
            stats,
            req.path
          )
        );
    } catch (err) {
      next(err);
    }
  };
}
