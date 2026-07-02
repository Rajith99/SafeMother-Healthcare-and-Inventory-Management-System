import { AnalyticsService } from "../services/AnalyticsService.js";

export class AnalyticsController {
  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getStats = async (req, res, next) => {
    try {
      const stats = await this.analyticsService.getSystemStats();

      return res.status(200).json({
        success: true,
        message: "Analytics data retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
