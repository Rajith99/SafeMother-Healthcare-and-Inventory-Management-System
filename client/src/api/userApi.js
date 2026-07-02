import axiosInstance from "./axiosInstance";

export const userService = {
  getAllUsers(filters = {}) {
    return axiosInstance.get("/users", { params: filters });
  },

  getPendingValidation(params = {}) {
    return axiosInstance.get("/users/pending-validation", { params });
  },

  activateUser(userId) {
    return axiosInstance.patch(`/users/${userId}/activate`);
  },

  deactivateUser(userId) {
    return axiosInstance.patch(`/users/${userId}/deactivate`);
  },

  getUserById(userId) {
    return axiosInstance.get(`/users/${userId}`);
  },

  updateUser(userId, data) {
    return axiosInstance.patch(`/users/${userId}`, data);
  },

  changePassword(userId, currentPassword, newPassword) {
    return axiosInstance.patch(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  },

  deleteUser(userId) {
    return axiosInstance.delete(`/users/${userId}`);
  },

  adminDeleteUser(userId) {
    return axiosInstance.delete(`/users/${userId}/admin-delete`);
  },

  searchDoctors(query, limit = 10) {
    return axiosInstance.get("/users/doctors/search", {
      params: { query, limit },
    });
  },

  searchMidwives(query, limit = 10) {
    return axiosInstance.get("/users/midwives/search", {
      params: { query, limit },
    });
  },
};
