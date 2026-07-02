import axiosInstance from "./axiosInstance";

export const analyticsService = {
  getStats() {
    return axiosInstance.get("/analytics");
  },
};
