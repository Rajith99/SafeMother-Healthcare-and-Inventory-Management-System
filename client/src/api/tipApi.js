import axiosInstance from "./axiosInstance";


export const getTipsForCurrentWeek = () => axiosInstance.get("/tips/current-week");
