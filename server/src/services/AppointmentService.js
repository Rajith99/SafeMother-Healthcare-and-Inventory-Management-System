import { AppointmentRepository } from "../repositories/AppointmentRepository.js";
import { PregnancyRepository } from "../repositories/PregnancyRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { GeminiService } from "./GeminiService.js";

export class AppointmentService {
  constructor() {
    this.appointmentRepo = new AppointmentRepository();
    this.pregnancyRepo = new PregnancyRepository();
    this.userRepo = new UserRepository();
    this.geminiService = new GeminiService();
  }
  
  




  _parseSLDate(dateStr) {
    if (!dateStr) return null;
    
    
    
    if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+") && !dateStr.match(/-\d{2}:\d{2}$/)) {
      return new Date(`${dateStr}:00+05:30`);
    }
    
    return new Date(dateStr);
  }

  
    
   
  async createAppointment(user, pregnancyId, preferredDateTime) {
    
    if (user.role !== "MOTHER") {
      const err = new Error("Only mothers can create appointments");
      err.statusCode = 403;
      throw err;
    }

    
    const pregnancy = await this.pregnancyRepo.findById(pregnancyId);
    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    if (pregnancy.user !== user.userId) {
      const err = new Error("This pregnancy does not belong to you");
      err.statusCode = 403;
      throw err;
    }

    
    if (pregnancy.status !== "ACTIVE") {
      const err = new Error("Pregnancy is not active");
      err.statusCode = 400;
      throw err;
    }

    
    if (!pregnancy.midwife) {
      const err = new Error(
        "Midwife must be assigned to your pregnancy before creating appointments",
      );
      err.statusCode = 400;
      throw err;
    }

    
    if (!preferredDateTime) {
      const err = new Error("preferredDateTime is required");
      err.statusCode = 400;
      throw err;
    }

    const parsedPreferredDateTime = this._parseSLDate(preferredDateTime);
    if (isNaN(parsedPreferredDateTime.getTime())) {
      const err = new Error("preferredDateTime must be a valid datetime");
      err.statusCode = 400;
      throw err;
    }

    
    const existingActiveAppointment =
      await this.appointmentRepo.findActiveByMotherAndPregnancy(
        user.userId,
        pregnancyId,
      );
    if (existingActiveAppointment) {
      const err = new Error(
        "You already have an active appointment workflow for this pregnancy",
      );
      err.statusCode = 400;
      throw err;
    }

    
    const midwife = await this.userRepo.findById(pregnancy.midwife);
    if (!midwife || !midwife.isActive) {
      const err = new Error("Assigned midwife is not available");
      err.statusCode = 400;
      throw err;
    }

    
    const appointmentData = {
      pregnancy: pregnancyId,
      mother: user.userId,
      midwife: pregnancy.midwife,
      appointmentDate: parsedPreferredDateTime,
      preferredDateTime: parsedPreferredDateTime,
      confirmedDateTime: null,
      status: "PENDING",
      rejectionReason: null,
      rescheduleReason: null,
    };

    return await this.appointmentRepo.create(appointmentData);
  }

  


  async getAppointmentById(user, appointmentId) {
    const appointment = await this.appointmentRepo.findById(appointmentId);

    if (!appointment) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }

    
    const hasAccess =
      appointment.mother._id === user.userId ||
      appointment.midwife._id === user.userId ||
      (appointment.pregnancy.doctor &&
        appointment.pregnancy.doctor === user.userId);

    if (!hasAccess) {
      const err = new Error("Access denied to this appointment");
      err.statusCode = 403;
      throw err;
    }

    return appointment;
  }

  
   
  
  async listAppointmentsByUser(user) {
    if (user.role === "MOTHER") {
      return await this.appointmentRepo.findByMotherId(user.userId);
    } else if (user.role === "MIDWIFE") {
      return await this.appointmentRepo.findByMidwifeId(user.userId);
    } else if (user.role === "DOCTOR") {
      
      const pregnancies = await this.pregnancyRepo.findAllByDoctor(user.userId);
      const pregnancyIds = pregnancies.map(p => p._id);
      return await this.appointmentRepo.findByPregnancyIds(pregnancyIds);
    } else {
      const err = new Error("Invalid user role for appointments");
      err.statusCode = 403;
      throw err;
    }
  }

  
  
   
  async respondToAppointment(
    user,
    appointmentId,
    status,
    confirmedDateTime = null,
    rejectionReason = null,
  ) {
    
    if (user.role !== "MIDWIFE") {
      const err = new Error("Only midwives can respond to appointment requests");
      err.statusCode = 403;
      throw err;
    }

    
    if (!["APPROVED", "REJECTED"].includes(status)) {
      const err = new Error("Status must be APPROVED or REJECTED");
      err.statusCode = 400;
      throw err;
    }

    
    const appointment = await this.appointmentRepo.findByIdBasic(appointmentId);
    if (!appointment) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }

    
    if (appointment.midwife !== user.userId) {
      const err = new Error("This appointment is not assigned to you");
      err.statusCode = 403;
      throw err;
    }

    
    if (!["PENDING", "RESCHEDULE_REQUESTED"].includes(appointment.status)) {
      const err = new Error(
        "Appointment can only be reviewed when status is PENDING or RESCHEDULE_REQUESTED",
      );
      err.statusCode = 400;
      throw err;
    }

    
    const updateData = { status };
    if (status === "APPROVED") {
      if (!confirmedDateTime) {
        const err = new Error("confirmedDateTime is required when approving an appointment");
        err.statusCode = 400;
        throw err;
      }

      const parsedConfirmedDateTime = this._parseSLDate(confirmedDateTime);
      if (isNaN(parsedConfirmedDateTime.getTime())) {
        const err = new Error("confirmedDateTime must be a valid datetime");
        err.statusCode = 400;
        throw err;
      }

      updateData.confirmedDateTime = parsedConfirmedDateTime;
      updateData.appointmentDate = parsedConfirmedDateTime;
      updateData.rejectionReason = null;
      updateData.rescheduleReason = null;
    } else {
      if (!rejectionReason) {
        const err = new Error("Rejection reason is required when rejecting an appointment");
        err.statusCode = 400;
        throw err;
      }

      updateData.rejectionReason = rejectionReason;
      updateData.confirmedDateTime = null;
    }

    return await this.appointmentRepo.update(appointmentId, updateData);
  }

  


  async respondToMidwifeDecision(
    user,
    appointmentId,
    status,
    preferredDateTime = null,
    rescheduleReason = null,
  ) {
    if (user.role !== "MOTHER") {
      const err = new Error("Only mothers can confirm or request reschedule");
      err.statusCode = 403;
      throw err;
    }

    if (!["CONFIRMED", "RESCHEDULE_REQUESTED"].includes(status)) {
      const err = new Error("Status must be CONFIRMED or RESCHEDULE_REQUESTED");
      err.statusCode = 400;
      throw err;
    }

    const appointment = await this.appointmentRepo.findByIdBasic(appointmentId);
    if (!appointment) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }

    if (appointment.mother !== user.userId) {
      const err = new Error("This appointment does not belong to you");
      err.statusCode = 403;
      throw err;
    }

    if (appointment.status !== "APPROVED") {
      const err = new Error(
        "Mother can only confirm or request reschedule after midwife approval",
      );
      err.statusCode = 400;
      throw err;
    }

    const updateData = { status };
    if (status === "CONFIRMED") {
      updateData.rescheduleReason = null;
      updateData.rejectionReason = null;
      return await this.appointmentRepo.update(appointmentId, updateData);
    }

    if (!preferredDateTime) {
      const err = new Error(
        "preferredDateTime is required when requesting a reschedule",
      );
      err.statusCode = 400;
      throw err;
    }

    const parsedPreferredDateTime = this._parseSLDate(preferredDateTime);
    if (isNaN(parsedPreferredDateTime.getTime())) {
      const err = new Error("preferredDateTime must be a valid datetime");
      err.statusCode = 400;
      throw err;
    }

    updateData.preferredDateTime = parsedPreferredDateTime;
    updateData.appointmentDate = parsedPreferredDateTime;
    updateData.confirmedDateTime = null;
    updateData.rescheduleReason = rescheduleReason || "Mother requested reschedule";
    updateData.rejectionReason = null;

    return await this.appointmentRepo.update(appointmentId, updateData);
  }

  


  async fillAppointmentInfo(user, appointmentId, appointmentData) {
    
    if (user.role !== "MIDWIFE") {
      const err = new Error("Only midwives can fill appointment information");
      err.statusCode = 403;
      throw err;
    }

    
    const appointment = await this.appointmentRepo.findByIdBasic(appointmentId);
    if (!appointment) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }

    
    if (appointment.midwife !== user.userId) {
      const err = new Error("This appointment is not assigned to you");
      err.statusCode = 403;
      throw err;
    }

    
    if (appointment.status !== "CONFIRMED") {
      const err = new Error(
        "Appointment must be CONFIRMED by mother before filling information",
      );
      err.statusCode = 400;
      throw err;
    }

    
    if (!appointmentData.pulseRate) {
      const err = new Error("Pulse rate is required");
      err.statusCode = 400;
      throw err;
    }

    
    const updateData = {
      pulseRate: appointmentData.pulseRate,
      temperature: appointmentData.temperature,
      bloodPressure: appointmentData.bloodPressure,
      specialMedicalConditions: Array.isArray(
        appointmentData.specialMedicalConditions,
      )
        ? appointmentData.specialMedicalConditions
        : appointmentData.specialMedicalConditions
          ? [appointmentData.specialMedicalConditions]
          : [],
      appointmentNotes: appointmentData.appointmentNotes,
      isCompleted: true,
      completedAt: new Date(),
    };

    return await this.appointmentRepo.update(appointmentId, updateData);
  }

  


  async getUpcomingAppointments(user) {
    if (user.role !== "MIDWIFE") {
      const err = new Error("Only midwives can view upcoming appointments");
      err.statusCode = 403;
      throw err;
    }

    return await this.appointmentRepo.findUpcomingByMidwife(user.userId);
  }

  


  async getCompletedAppointments(user) {
    if (user.role !== "MIDWIFE") {
      const err = new Error("Only midwives can view completed appointments");
      err.statusCode = 403;
      throw err;
    }

    return await this.appointmentRepo.findCompletedByMidwife(user.userId);
  }

  


  async getAppointmentsByPregnancy(user, pregnancyId) {
    
    const pregnancy = await this.pregnancyRepo.findById(pregnancyId);
    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    const hasAccess =
      pregnancy.user === user.userId ||
      (pregnancy.midwife && pregnancy.midwife === user.userId);

    if (!hasAccess) {
      const err = new Error("Access denied to this pregnancy");
      err.statusCode = 403;
      throw err;
    }

    return await this.appointmentRepo.findByPregnancyId(pregnancyId);
  }

  


  async cancelAppointment(user, appointmentId, cancelReason = null) {
    const appointment = await this.appointmentRepo.findByIdBasic(appointmentId);
    if (!appointment) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }

    
    if (user.role === "MOTHER") {
      if (appointment.mother !== user.userId) {
        const err = new Error("This appointment does not belong to you");
        err.statusCode = 403;
        throw err;
      }
      
      if (appointment.status !== "PENDING") {
        const err = new Error("Can only cancel pending appointments");
        err.statusCode = 400;
        throw err;
      }
    } else if (user.role === "MIDWIFE") {
      if (appointment.midwife !== user.userId) {
        const err = new Error("This appointment is not assigned to you");
        err.statusCode = 403;
        throw err;
      }
      
      if (appointment.isCompleted) {
        const err = new Error("Cannot cancel completed appointments");
        err.statusCode = 400;
        throw err;
      }
    } else {
      const err = new Error("Invalid user role for canceling appointments");
      err.statusCode = 403;
      throw err;
    }

    
    const updateData = {
      status: "CANCELLED",
      rejectionReason: cancelReason || "Appointment cancelled",
    };

    return await this.appointmentRepo.update(appointmentId, updateData);
  }

  


  async deleteAppointmentByMother(user, appointmentId) {
    if (user.role !== "MOTHER") {
      const err = new Error("Only mothers can delete appointments");
      err.statusCode = 403;
      throw err;
    }

    const appointment = await this.appointmentRepo.findByIdBasic(appointmentId);
    if (!appointment) {
      const err = new Error("Appointment not found");
      err.statusCode = 404;
      throw err;
    }

    if (appointment.mother !== user.userId) {
      const err = new Error("This appointment does not belong to you");
      err.statusCode = 403;
      throw err;
    }

    if (appointment.isCompleted) {
      const err = new Error("Cannot delete completed appointments");
      err.statusCode = 400;
      throw err;
    }

    return await this.appointmentRepo.delete(appointmentId);
  }

  


  async analyzeAppointmentWithAi(user, appointmentId) {
    const appointment = await this.getAppointmentById(user, appointmentId);

    const payload = {
      appointmentId: appointment._id,
      status: appointment.status,
      appointmentDate: appointment.appointmentDate,
      preferredDateTime: appointment.preferredDateTime,
      confirmedDateTime: appointment.confirmedDateTime,
      pulseRate: appointment.pulseRate,
      temperature: appointment.temperature,
      bloodPressure: appointment.bloodPressure,
      specialMedicalConditions: appointment.specialMedicalConditions || [],
      appointmentNotes: appointment.appointmentNotes || "",
      isCompleted: appointment.isCompleted,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    const aiCheck = await this.geminiService.generateAppointmentCheck(payload);

    return {
      appointmentId: appointment._id,
      status: appointment.status,
      aiCheck,
      generatedAt: new Date(),
    };
  }
}
