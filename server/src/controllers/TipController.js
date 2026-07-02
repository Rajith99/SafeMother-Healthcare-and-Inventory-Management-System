import { TipService } from "../services/TipService.js";

export class TipController {
  constructor() {
    this.tipService = new TipService();
  }

  
  getTipsForCurrentWeek = async (req, res, next) => {
    try {
      const { tips, week, showWeekBadge } =
        await this.tipService.getTipsForCurrentWeek(req.user.userId);

      return res.status(200).json({
        success: true,
        message: `Pregnancy tips for week ${week} retrieved successfully`,
        week,
        showWeekBadge,
        data: tips,
      });
    } catch (error) {
      next(error);
    }
  };
}
