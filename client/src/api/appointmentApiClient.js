import axiosInstance from "./axiosInstance";


export const createAppointment = ({ pregnancyId, preferredDateTime }) =>
  axiosInstance.post("/appointments", { pregnancyId, preferredDateTime });


export const listAppointments = () => axiosInstance.get("/appointments");


export const getAppointment = (id) => axiosInstance.get(`/appointments/${id}`);


export const getAppointmentsByPregnancy = (pregnancyId) =>
  axiosInstance.get(`/appointments/pregnancy/${pregnancyId}`);


export const respondToAppointment = (id, { status, confirmedDateTime, rejectionReason }) =>
  axiosInstance.patch(`/appointments/${id}/respond`, {
    status,
    confirmedDateTime,
    rejectionReason,
  });


export const motherResponse = (id, { status, preferredDateTime, rescheduleReason }) =>
  axiosInstance.patch(`/appointments/${id}/mother-response`, {
    status,
    preferredDateTime,
    rescheduleReason,
  });


export const fillAppointmentInfo = (
  id,
  { pulseRate, temperature, bloodPressure, specialMedicalConditions, appointmentNotes }
) =>
  axiosInstance.patch(`/appointments/${id}/fill-info`, {
    pulseRate,
    temperature,
    bloodPressure,
    specialMedicalConditions,
    appointmentNotes,
  });


export const cancelAppointment = (id, cancelReason) =>
  axiosInstance.patch(`/appointments/${id}/cancel`, { cancelReason });


export const deleteAppointment = (id) => axiosInstance.delete(`/appointments/${id}`);


export const getUpcomingAppointments = () =>
  axiosInstance.get("/appointments/upcoming/mine");


export const getCompletedAppointments = () =>
  axiosInstance.get("/appointments/completed/mine");


export const getAiCheck = (id) => axiosInstance.post(`/appointments/${id}/ai-check`);
