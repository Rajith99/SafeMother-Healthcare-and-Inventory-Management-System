import { fetchTipsByWeekFromAPI } from "../utils/tipApiClient.js";
import { PregnancyRepository } from "../repositories/PregnancyRepository.js";

export class TipService {
  constructor() {
    this.pregnancyRepo = new PregnancyRepository();
  }

  
   
   
  async getTipsForCurrentWeek(userId) {
    try {
      const MIN_WEEK = 1;
      const MAX_WEEK = 42;

      const pregnancy = await this.pregnancyRepo.findActiveByUser(userId);
      const rawWeek = pregnancy?.pregnancyWeekNumber ?? null;

      
      const hasValidWeek =
        rawWeek !== null && rawWeek >= MIN_WEEK && rawWeek <= MAX_WEEK;

      
      const week = rawWeek
        ? Math.min(MAX_WEEK, Math.max(MIN_WEEK, rawWeek))
        : MIN_WEEK;

      const tips = await fetchTipsByWeekFromAPI(week);

      return {
        tips,
        week,
        
        showWeekBadge: hasValidWeek,
      };
    } catch (error) {
      const err = new Error("Failed to fetch pregnancy tips for current week");
      err.statusCode = 502;
      throw err;
    }
  }
}
