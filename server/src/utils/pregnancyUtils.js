import { fetchPregnancyMetricsFromAPI } from "./pregnancyApiClient.js";
export { fetchPregnancyMetricsFromAPI };

export function daysBetweenDates(startDate, endDate = new Date()) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  
  const utc1 = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const utc2 = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export function computeGestationalAge(lmpDate, asOfDate = new Date()) {
  const diffDays = daysBetweenDates(lmpDate, asOfDate);
  if (diffDays < 0) {
    throw new Error("LMP date cannot be in the future");
  }

  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  const weekNumber = weeks + 1;

  return {
    gestationalAgeWeeks: weeks,
    gestationalAgeDays: days,
    pregnancyWeekNumber: weekNumber,
  };
}

export function computeTrimesterFromWeeks(gestationalWeeks) {
  if (gestationalWeeks < 14) return "FIRST";
  if (gestationalWeeks < 28) return "SECOND";
  return "THIRD";
}


export function computeEddFromLmp(lmpDate) {
  const lmp = new Date(lmpDate);
  return new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
}


function computeLocalMetrics(lmpDate, asOfDate = new Date()) {
  const { gestationalAgeWeeks, gestationalAgeDays, pregnancyWeekNumber } =
    computeGestationalAge(lmpDate, asOfDate);

  const trimester = computeTrimesterFromWeeks(gestationalAgeWeeks);
  const eddDate = computeEddFromLmp(lmpDate);

  
  const totalDays = gestationalAgeWeeks * 7 + gestationalAgeDays;
  const percentageComplete = Math.min(Math.round((totalDays / 280) * 100), 100);

  return {
    eddDate,
    gestationalAgeWeeks,
    gestationalAgeDays,
    trimester,
    pregnancyWeekNumber,
    percentageComplete,
  };
}

export async function computeAllMetrics(lmpDate, cycleLength = 28) {
  try {
    
    const metrics = await fetchPregnancyMetricsFromAPI(lmpDate, cycleLength);
    return metrics;
  } catch (error) {
    console.warn(
      "External pregnancy API failed, using local calculation:",
      error.message,
    );

    return computeLocalMetrics(lmpDate);
  }
}
