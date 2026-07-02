import axiosInstance from "./axiosInstance";

export const pregnancyService = {
  create(data) {
    return axiosInstance.post("/pregnancies", data);
  },

  listMine() {
    return axiosInstance.get("/pregnancies");
  },

  getById(pregnancyId) {
    return axiosInstance.get(`/pregnancies/${pregnancyId}`);
  },

  assignDoctor(pregnancyId, doctorId) {
    return axiosInstance.post(`/pregnancies/${pregnancyId}/assign-doctor`, {
      doctorId,
    });
  },

  assignMidwife(pregnancyId, midwifeId) {
    return axiosInstance.post(`/pregnancies/${pregnancyId}/assign-midwife`, {
      midwifeId,
    });
  },

  cancel(pregnancyId) {
    return axiosInstance.patch(`/pregnancies/${pregnancyId}/cancel`);
  },

  update(pregnancyId, data) {
    return axiosInstance.patch(`/pregnancies/${pregnancyId}`, data);
  },
};
