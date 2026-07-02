import { PregnancyRepository } from "../repositories/PregnancyRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { ChatService } from "./ChatService.js";
import { computeAllMetrics } from "../utils/pregnancyUtils.js";

export class PregnancyService {
  constructor() {
    this.repo = new PregnancyRepository();
    this.userRepo = new UserRepository();
    this.chatService = new ChatService();
  }

  isDueDatePassed(eddDate) {
    if (!eddDate) return false;
    const dueDate = new Date(eddDate);
    if (Number.isNaN(dueDate.getTime())) return false;
    return Date.now() > dueDate.getTime();
  }

  validateLmpWithinLastNineMonths(lmpDateInput) {
    const lmpDate = new Date(lmpDateInput);
    if (Number.isNaN(lmpDate.getTime())) {
      const err = new Error("Invalid lmpDate");
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nineMonthsAgo = new Date(today);
    nineMonthsAgo.setMonth(nineMonthsAgo.getMonth() - 9);

    const lmpDay = new Date(
      lmpDate.getFullYear(),
      lmpDate.getMonth(),
      lmpDate.getDate(),
    );

    if (lmpDay < nineMonthsAgo || lmpDay > today) {
      const err = new Error("LMP date must be within the last 9 months");
      err.statusCode = 400;
      throw err;
    }
  }

  async markAsCompletedIfDuePassed(pregnancy) {
    if (!pregnancy) return pregnancy;

    const shouldMarkCompleted =
      pregnancy.status !== "COMPLETED" &&
      pregnancy.status !== "CANCELLED" &&
      this.isDueDatePassed(pregnancy.eddDate);

    if (!shouldMarkCompleted) {
      return pregnancy;
    }

    await this.repo.update(pregnancy._id, { status: "COMPLETED" });
    return { ...pregnancy, status: "COMPLETED" };
  }

  async markManyAsCompletedIfDuePassed(pregnancies) {
    if (!Array.isArray(pregnancies) || pregnancies.length === 0) {
      return pregnancies;
    }

    return await Promise.all(
      pregnancies.map((pregnancy) =>
        this.markAsCompletedIfDuePassed(pregnancy),
      ),
    );
  }

  async createPregnancy(user, payload) {
    
    if (!user || user.role !== "MOTHER") {
      const err = new Error("Only mothers can create pregnancies");
      err.statusCode = 403;
      throw err;
    }

    
    const existing = await this.repo.findActiveByUser(user.userId);
    if (existing) {
      const err = new Error("An active pregnancy already exists for this user");
      err.statusCode = 400;
      throw err;
    }

    
    if (!payload.lmpDate) {
      const err = new Error("lmpDate is required");
      err.statusCode = 400;
      throw err;
    }

    this.validateLmpWithinLastNineMonths(payload.lmpDate);

    
    const cycleLength = payload.cycleLength || 28;
    const metrics = await computeAllMetrics(payload.lmpDate, cycleLength);

    const createData = {
      user: user.userId,
      lmpDate: payload.lmpDate,
      cycleLength: cycleLength,
      isFirstPregnancy: !!payload.isFirstPregnancy,
      bloodGroup: payload.bloodGroup || undefined,
      medicalConditions: Array.isArray(payload.medicalConditions)
        ? payload.medicalConditions
        : payload.medicalConditions
          ? [payload.medicalConditions]
          : [],
      allergies: Array.isArray(payload.allergies)
        ? payload.allergies
        : payload.allergies
          ? [payload.allergies]
          : [],
      previousComplications: Array.isArray(payload.previousComplications)
        ? payload.previousComplications
        : payload.previousComplications
          ? [payload.previousComplications]
          : [],
      complicationNotes: payload.complicationNotes || undefined,
      eddDate: metrics.eddDate,
      gestationalAgeWeeks: metrics.gestationalAgeWeeks,
      gestationalAgeDays: metrics.gestationalAgeDays,
      trimester: metrics.trimester,
      pregnancyWeekNumber: metrics.pregnancyWeekNumber,
      percentageComplete: metrics.percentageComplete,
      status: "ACTIVE",
    };

    const created = await this.repo.create(createData);
    return await this.repo.findByIdPopulated(created._id);
  }

  async listByUser(user) {
    let items;

    if (user.role === "DOCTOR") {
      items = await this.repo.findAllByDoctor(user.userId);
    } else if (user.role === "MIDWIFE") {
      items = await this.repo.findAllByMidwife(user.userId);
    } else {
      
      items = await this.repo.findAllByUser(user.userId);
    }

    return await this.markManyAsCompletedIfDuePassed(items);
  }

  async getById(user, pregnancyId) {
    const pregnancy = await this.repo.findByIdPopulated(pregnancyId);

    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    if (pregnancy.status === "CANCELLED") {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    const ownerId = pregnancy.user._id?.toString?.() || String(pregnancy.user._id || pregnancy.user);
    const doctorId =
      pregnancy.doctor?._id?.toString?.() || String(pregnancy.doctor || '');
    const midwifeId =
      pregnancy.midwife?._id?.toString?.() || String(pregnancy.midwife || '');

    if (
      user.userId !== ownerId &&
      user.userId !== doctorId &&
      user.userId !== midwifeId
    ) {
      const err = new Error(
        "Access denied. You are not authorized to view this pregnancy",
      );
      err.statusCode = 403;
      throw err;
    }

    return await this.markAsCompletedIfDuePassed(pregnancy);
  }

  async assignDoctor(user, pregnancyId, doctorId) {
    
    const pregnancy = await this.repo.findById(pregnancyId);
    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    const ownerId = String(pregnancy.user);
    if (String(user.userId) !== ownerId) {
      const err = new Error(
        "Only the mother can assign a doctor to her pregnancy",
      );
      err.statusCode = 403;
      throw err;
    }

    
    if (pregnancy.status !== "ACTIVE") {
      const err = new Error("Cannot assign a doctor to a non-active pregnancy");
      err.statusCode = 400;
      throw err;
    }

    
    const doctor = await this.userRepo.findById(doctorId);
    if (!doctor) {
      const err = new Error("Doctor not found");
      err.statusCode = 404;
      throw err;
    }
    if (doctor.role !== "DOCTOR") {
      const err = new Error("Only a doctor can be assigned to a pregnancy");
      err.statusCode = 400;
      throw err;
    }

    
    if (pregnancy.doctor && String(pregnancy.doctor) === String(doctorId)) {
      const err = new Error("This doctor is already assigned to the pregnancy");
      err.statusCode = 400;
      throw err;
    }

    
    const oldDoctorId = pregnancy.doctor ? String(pregnancy.doctor) : null;

    await this.repo.assignDoctor(pregnancyId, doctorId);

    
    if (oldDoctorId && oldDoctorId !== doctorId) {
      try {
        await this.chatService.deactivateChatBetween(
          pregnancyId,
          String(pregnancy.user),
          oldDoctorId,
        );
      } catch (chatErr) {
        console.error(
          "[PregnancyService] Failed to freeze old doctor chat:",
          chatErr.message,
        );
      }
    }

    
    try {
      await this.chatService.createPregnancyChat(
        pregnancyId,
        String(pregnancy.user),
        doctorId,
      );
    } catch (chatErr) {
      console.error(
        "[PregnancyService] Failed to create doctor chat:",
        chatErr.message,
      );
    }

    return await this.repo.findByIdPopulated(pregnancyId);
  }

  async assignMidwife(user, pregnancyId, midwifeId) {
    
    const pregnancy = await this.repo.findById(pregnancyId);
    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    if (!pregnancy.doctor) {
      const err = new Error(
        "A doctor must be assigned before assigning a midwife",
      );
      err.statusCode = 400;
      throw err;
    }

    
    if (String(pregnancy.doctor) !== String(user.userId)) {
      const err = new Error("Only the assigned doctor can assign a midwife");
      err.statusCode = 403;
      throw err;
    }

    
    if (pregnancy.status !== "ACTIVE") {
      const err = new Error(
        "Cannot assign a midwife to a non-active pregnancy",
      );
      err.statusCode = 400;
      throw err;
    }

    
    const midwife = await this.userRepo.findById(midwifeId);
    if (!midwife) {
      const err = new Error("Midwife not found");
      err.statusCode = 404;
      throw err;
    }
    if (midwife.role !== "MIDWIFE") {
      const err = new Error("The specified user is not a midwife");
      err.statusCode = 400;
      throw err;
    }

    
    if (pregnancy.midwife && String(pregnancy.midwife) === String(midwifeId)) {
      const err = new Error(
        "This midwife is already assigned to the pregnancy",
      );
      err.statusCode = 400;
      throw err;
    }

    
    const oldMidwifeId = pregnancy.midwife ? String(pregnancy.midwife) : null;

    await this.repo.assignMidwife(pregnancyId, midwifeId);

    
    if (oldMidwifeId && oldMidwifeId !== midwifeId) {
      try {
        await this.chatService.deactivateChatBetween(
          pregnancyId,
          String(pregnancy.user),
          oldMidwifeId,
        );
      } catch (chatErr) {
        console.error(
          "[PregnancyService] Failed to freeze old midwife chat:",
          chatErr.message,
        );
      }
    }

    
    try {
      await this.chatService.createPregnancyChat(
        pregnancyId,
        String(pregnancy.user),
        midwifeId,
      );
    } catch (chatErr) {
      console.error(
        "[PregnancyService] Failed to create midwife chat:",
        chatErr.message,
      );
    }

    return await this.repo.findByIdPopulated(pregnancyId);
  }

  
  async cancelPregnancy(user, pregnancyId) {
    const pregnancy = await this.repo.findById(pregnancyId);
    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    const ownerId = String(pregnancy.user);
    if (user.role !== "MOTHER" || String(user.userId) !== ownerId) {
      const err = new Error("Only the mother can cancel her pregnancy");
      err.statusCode = 403;
      throw err;
    }

    
    if (pregnancy.status !== "ACTIVE") {
      const err = new Error("Only an active pregnancy can be cancelled");
      err.statusCode = 400;
      throw err;
    }

    await this.repo.update(pregnancyId, { status: "CANCELLED" });

    
    try {
      await this.chatService.deactivateChatsForPregnancy(pregnancyId);
    } catch (chatErr) {
      console.error(
        "[PregnancyService] Failed to deactivate chats:",
        chatErr.message,
      );
    }

    return await this.repo.findByIdPopulated(pregnancyId);
  }

  
  async updatePregnancy(user, pregnancyId, payload) {
    const pregnancy = await this.repo.findById(pregnancyId);
    if (!pregnancy) {
      const err = new Error("Pregnancy not found");
      err.statusCode = 404;
      throw err;
    }

    
    const ownerId = String(pregnancy.user);
    if (user.role !== "MOTHER" || String(user.userId) !== ownerId) {
      const err = new Error("Only the mother can update her pregnancy");
      err.statusCode = 403;
      throw err;
    }

    
    if (pregnancy.status !== "ACTIVE") {
      const err = new Error("Only an active pregnancy can be updated");
      err.statusCode = 400;
      throw err;
    }

    
    const allowedFields = [
      "lmpDate",
      "cycleLength",
      "isFirstPregnancy",
      "bloodGroup",
      "medicalConditions",
      "allergies",
      "previousComplications",
      "complicationNotes",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        if (
          field === "medicalConditions" ||
          field === "allergies" ||
          field === "previousComplications"
        ) {
          updateData[field] = Array.isArray(payload[field])
            ? payload[field]
            : [payload[field]];
        } else {
          updateData[field] = payload[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      const err = new Error("No valid fields provided for update");
      err.statusCode = 400;
      throw err;
    }

    if (updateData.lmpDate !== undefined) {
      this.validateLmpWithinLastNineMonths(updateData.lmpDate);
    }

    
    if (updateData.lmpDate || updateData.cycleLength) {
      const lmpDate = updateData.lmpDate || pregnancy.lmpDate;
      const cycleLength = updateData.cycleLength || pregnancy.cycleLength || 28;
      const metrics = await computeAllMetrics(lmpDate, cycleLength);
      updateData.eddDate = metrics.eddDate;
      updateData.gestationalAgeWeeks = metrics.gestationalAgeWeeks;
      updateData.gestationalAgeDays = metrics.gestationalAgeDays;
      updateData.trimester = metrics.trimester;
      updateData.pregnancyWeekNumber = metrics.pregnancyWeekNumber;
      updateData.percentageComplete = metrics.percentageComplete;
    }

    await this.repo.update(pregnancyId, updateData);
    return await this.repo.findByIdPopulated(pregnancyId);
  }
}
