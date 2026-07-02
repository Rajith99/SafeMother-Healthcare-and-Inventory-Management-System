import axios from "axios";

const PREGNANCY_API_BASE_URL = process.env.PREGNANCY_API_BASE_URL;
const PREGNANCY_API_URL = `${PREGNANCY_API_BASE_URL}/api/calculate-pregnancy`;

function mapTrimester(trimestre) {
  const map = {
    first: "FIRST",
    second: "SECOND",
    third: "THIRD",
  };
  return map[trimestre?.toLowerCase()] || "FIRST";
}

export async function fetchPregnancyMetricsFromAPI(lmpDate, cycleLength = 28) {
  
  const dateStr =
    lmpDate instanceof Date
      ? lmpDate.toISOString().split("T")[0]
      : new Date(lmpDate).toISOString().split("T")[0];

  const response = await axios.post(PREGNANCY_API_URL, {
    firstDayOfLastPeriod: dateStr,
    cycleLength: cycleLength,
  });

  const result = response.data.result;

  
  return {
    eddDate: new Date(result.dueDate),
    gestationalAgeWeeks: result.numberOfWeeks,
    gestationalAgeDays: result.remainingDays,
    trimester: mapTrimester(result.trimstre),
    pregnancyWeekNumber: result.currentWeek,
    conceivedDate: new Date(result.conceivedDate),
    percentageComplete: result.percentageOfPregnancyTime,
  };
}
