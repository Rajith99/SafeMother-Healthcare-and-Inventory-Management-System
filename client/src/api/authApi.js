import axiosInstance from "./axiosInstance";

export const authService = {
  login(email, password) {
    return axiosInstance.post("/auth/login", { email, password });
  },

  register(data) {
    return axiosInstance.post("/auth/register", data);
  },

  me() {
    return axiosInstance.get("/auth/me");
  },

  logout() {
    return axiosInstance.post("/auth/logout");
  },

  forgotPassword(email) {
    return axiosInstance.post("/auth/forgot-password", { email });
  },

  resetPassword(email, token, newPassword) {
    return axiosInstance.post("/auth/reset-password", { email, token, newPassword });
  },
};
