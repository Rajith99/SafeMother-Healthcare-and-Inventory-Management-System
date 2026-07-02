import { getPool, sql } from "../config/database.js";

export class PregnancyRepository {
  
  _parseArrayField(value) {
    if (!value) return [];
    try { return JSON.parse(value); } catch { return []; }
  }

  
  _formatRow(row) {
    if (!row) return null;
    row.medicalConditions = this._parseArrayField(row.medicalConditions);
    row.allergies = this._parseArrayField(row.allergies);
    row.previousComplications = this._parseArrayField(row.previousComplications);
    return row;
  }

  async create(data) {
    const pool = getPool();
    const result = await pool.request()
      .input("userId", sql.Int, data.user)
      .input("lmpDate", sql.Date, data.lmpDate)
      .input("cycleLength", sql.Int, data.cycleLength || 28)
      .input("isFirstPregnancy", sql.Bit, data.isFirstPregnancy || false)
      .input("bloodGroup", sql.NVarChar(10), data.bloodGroup || null)
      .input("medicalConditions", sql.NVarChar(sql.MAX), JSON.stringify(data.medicalConditions || []))
      .input("allergies", sql.NVarChar(sql.MAX), JSON.stringify(data.allergies || []))
      .input("previousComplications", sql.NVarChar(sql.MAX), JSON.stringify(data.previousComplications || []))
      .input("complicationNotes", sql.NVarChar(sql.MAX), data.complicationNotes || null)
      .input("eddDate", sql.Date, data.eddDate || null)
      .input("gestationalAgeWeeks", sql.Int, data.gestationalAgeWeeks || null)
      .input("gestationalAgeDays", sql.Int, data.gestationalAgeDays || null)
      .input("trimester", sql.VarChar(10), data.trimester || null)
      .input("pregnancyWeekNumber", sql.Int, data.pregnancyWeekNumber || null)
      .input("percentageComplete", sql.Decimal(5, 2), data.percentageComplete || null)
      .input("status", sql.VarChar(10), data.status || "ACTIVE")
      .query(`
        INSERT INTO Pregnancies (UserID, LmpDate, CycleLength, IsFirstPregnancy, BloodGroup,
          MedicalConditions, Allergies, PreviousComplications, ComplicationNotes,
          EddDate, GestationalAgeWeeks, GestationalAgeDays, Trimester,
          PregnancyWeekNumber, PercentageComplete, Status)
        OUTPUT INSERTED.PregnancyID AS _id
        VALUES (@userId, @lmpDate, @cycleLength, @isFirstPregnancy, @bloodGroup,
          @medicalConditions, @allergies, @previousComplications, @complicationNotes,
          @eddDate, @gestationalAgeWeeks, @gestationalAgeDays, @trimester,
          @pregnancyWeekNumber, @percentageComplete, @status)
      `);
    return result.recordset[0];
  }

  async findActiveByUser(userId) {
    const pool = getPool();
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT PregnancyID AS _id, UserID AS [user], LmpDate AS lmpDate,
               CycleLength AS cycleLength, IsFirstPregnancy AS isFirstPregnancy,
               BloodGroup AS bloodGroup, MedicalConditions AS medicalConditions,
               Allergies AS allergies, PreviousComplications AS previousComplications,
               ComplicationNotes AS complicationNotes, EddDate AS eddDate,
               GestationalAgeWeeks AS gestationalAgeWeeks, GestationalAgeDays AS gestationalAgeDays,
               Trimester AS trimester, PregnancyWeekNumber AS pregnancyWeekNumber,
               PercentageComplete AS percentageComplete, Status AS status,
               DoctorID AS doctor, MidwifeID AS midwife,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Pregnancies WHERE UserID = @userId AND Status = 'ACTIVE'
      `);
    return this._formatRow(result.recordset[0]) || null;
  }

  async findById(id) {
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT PregnancyID AS _id, UserID AS [user], LmpDate AS lmpDate,
               CycleLength AS cycleLength, IsFirstPregnancy AS isFirstPregnancy,
               BloodGroup AS bloodGroup, MedicalConditions AS medicalConditions,
               Allergies AS allergies, PreviousComplications AS previousComplications,
               ComplicationNotes AS complicationNotes, EddDate AS eddDate,
               GestationalAgeWeeks AS gestationalAgeWeeks, GestationalAgeDays AS gestationalAgeDays,
               Trimester AS trimester, PregnancyWeekNumber AS pregnancyWeekNumber,
               PercentageComplete AS percentageComplete, Status AS status,
               DoctorID AS doctor, MidwifeID AS midwife,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Pregnancies WHERE PregnancyID = @id
      `);
    return this._formatRow(result.recordset[0]) || null;
  }

  async findByIdPopulated(id) {
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT p.PregnancyID AS _id, p.LmpDate AS lmpDate,
               p.CycleLength AS cycleLength, p.IsFirstPregnancy AS isFirstPregnancy,
               p.BloodGroup AS bloodGroup, p.MedicalConditions AS medicalConditions,
               p.Allergies AS allergies, p.PreviousComplications AS previousComplications,
               p.ComplicationNotes AS complicationNotes, p.EddDate AS eddDate,
               p.GestationalAgeWeeks AS gestationalAgeWeeks, p.GestationalAgeDays AS gestationalAgeDays,
               p.Trimester AS trimester, p.PregnancyWeekNumber AS pregnancyWeekNumber,
               p.PercentageComplete AS percentageComplete, p.Status AS status,
               p.CreatedAt AS createdAt, p.UpdatedAt AS updatedAt,
               -- User (Mother)
               u.UserID AS [user._id], u.FullName AS [user.fullName], u.Email AS [user.email],
               -- Doctor
               d.UserID AS [doctor._id], d.FullName AS [doctor.fullName], d.Email AS [doctor.email],
               -- Midwife
               m.UserID AS [midwife._id], m.FullName AS [midwife.fullName], m.Email AS [midwife.email]
        FROM Pregnancies p
        INNER JOIN Users u ON p.UserID = u.UserID
        LEFT JOIN Users d ON p.DoctorID = d.UserID
        LEFT JOIN Users m ON p.MidwifeID = m.UserID
        WHERE p.PregnancyID = @id
      `);
    const row = result.recordset[0];
    if (!row) return null;

    const pregnancy = {
      _id: row._id,
      user: { _id: row["user._id"], fullName: row["user.fullName"], email: row["user.email"] },
      doctor: row["doctor._id"] ? { _id: row["doctor._id"], fullName: row["doctor.fullName"], email: row["doctor.email"] } : null,
      midwife: row["midwife._id"] ? { _id: row["midwife._id"], fullName: row["midwife.fullName"], email: row["midwife.email"] } : null,
      lmpDate: row.lmpDate, cycleLength: row.cycleLength,
      isFirstPregnancy: row.isFirstPregnancy, bloodGroup: row.bloodGroup,
      medicalConditions: this._parseArrayField(row.medicalConditions),
      allergies: this._parseArrayField(row.allergies),
      previousComplications: this._parseArrayField(row.previousComplications),
      complicationNotes: row.complicationNotes,
      eddDate: row.eddDate, gestationalAgeWeeks: row.gestationalAgeWeeks,
      gestationalAgeDays: row.gestationalAgeDays, trimester: row.trimester,
      pregnancyWeekNumber: row.pregnancyWeekNumber, percentageComplete: row.percentageComplete,
      status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt,
    };
    return pregnancy;
  }

  async assignDoctor(pregnancyId, doctorId) {
    const pool = getPool();
    await pool.request()
      .input("id", sql.Int, pregnancyId)
      .input("doctorId", sql.Int, doctorId)
      .query(`UPDATE Pregnancies SET DoctorID = @doctorId, UpdatedAt = GETDATE() WHERE PregnancyID = @id`);
    return await this.findById(pregnancyId);
  }

  async assignMidwife(pregnancyId, midwifeId) {
    const pool = getPool();
    await pool.request()
      .input("id", sql.Int, pregnancyId)
      .input("midwifeId", sql.Int, midwifeId)
      .query(`UPDATE Pregnancies SET MidwifeID = @midwifeId, UpdatedAt = GETDATE() WHERE PregnancyID = @id`);
    return await this.findById(pregnancyId);
  }

  async _findAllWithJoins(whereClause, params) {
    const pool = getPool();
    const request = pool.request();
    for (const [key, val] of Object.entries(params)) {
      request.input(key, sql.Int, val);
    }
    const result = await request.query(`
      SELECT p.PregnancyID AS _id, p.LmpDate AS lmpDate,
             p.CycleLength AS cycleLength, p.IsFirstPregnancy AS isFirstPregnancy,
             p.BloodGroup AS bloodGroup, p.MedicalConditions AS medicalConditions,
             p.Allergies AS allergies, p.PreviousComplications AS previousComplications,
             p.ComplicationNotes AS complicationNotes, p.EddDate AS eddDate,
             p.GestationalAgeWeeks AS gestationalAgeWeeks, p.GestationalAgeDays AS gestationalAgeDays,
             p.Trimester AS trimester, p.PregnancyWeekNumber AS pregnancyWeekNumber,
             p.PercentageComplete AS percentageComplete, p.Status AS status,
             p.CreatedAt AS createdAt, p.UpdatedAt AS updatedAt,
             u.UserID AS [user._id], u.FullName AS [user.fullName], u.Email AS [user.email],
             d.UserID AS [doctor._id], d.FullName AS [doctor.fullName], d.Email AS [doctor.email],
             m.UserID AS [midwife._id], m.FullName AS [midwife.fullName], m.Email AS [midwife.email]
      FROM Pregnancies p
      INNER JOIN Users u ON p.UserID = u.UserID
      LEFT JOIN Users d ON p.DoctorID = d.UserID
      LEFT JOIN Users m ON p.MidwifeID = m.UserID
      WHERE ${whereClause} AND p.Status != 'CANCELLED'
      ORDER BY p.CreatedAt DESC
    `);
    return result.recordset.map(row => ({
      _id: row._id,
      user: { _id: row["user._id"], fullName: row["user.fullName"], email: row["user.email"] },
      doctor: row["doctor._id"] ? { _id: row["doctor._id"], fullName: row["doctor.fullName"], email: row["doctor.email"] } : null,
      midwife: row["midwife._id"] ? { _id: row["midwife._id"], fullName: row["midwife.fullName"], email: row["midwife.email"] } : null,
      lmpDate: row.lmpDate, cycleLength: row.cycleLength,
      isFirstPregnancy: row.isFirstPregnancy, bloodGroup: row.bloodGroup,
      medicalConditions: this._parseArrayField(row.medicalConditions),
      allergies: this._parseArrayField(row.allergies),
      previousComplications: this._parseArrayField(row.previousComplications),
      complicationNotes: row.complicationNotes,
      eddDate: row.eddDate, gestationalAgeWeeks: row.gestationalAgeWeeks,
      gestationalAgeDays: row.gestationalAgeDays, trimester: row.trimester,
      pregnancyWeekNumber: row.pregnancyWeekNumber, percentageComplete: row.percentageComplete,
      status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt,
    }));
  }

  async findAllByUser(userId) {
    return this._findAllWithJoins("p.UserID = @userId", { userId });
  }

  async findAllByDoctor(doctorId) {
    return this._findAllWithJoins("p.DoctorID = @doctorId", { doctorId });
  }

  async findAllByMidwife(midwifeId) {
    return this._findAllWithJoins("p.MidwifeID = @midwifeId", { midwifeId });
  }

  async update(id, updateData) {
    const pool = getPool();
    const setClauses = [];
    const request = pool.request().input("id", sql.Int, id);

    const fieldMap = {
      lmpDate: { col: "LmpDate", type: sql.Date },
      cycleLength: { col: "CycleLength", type: sql.Int },
      isFirstPregnancy: { col: "IsFirstPregnancy", type: sql.Bit },
      bloodGroup: { col: "BloodGroup", type: sql.NVarChar(10) },
      complicationNotes: { col: "ComplicationNotes", type: sql.NVarChar(sql.MAX) },
      eddDate: { col: "EddDate", type: sql.Date },
      gestationalAgeWeeks: { col: "GestationalAgeWeeks", type: sql.Int },
      gestationalAgeDays: { col: "GestationalAgeDays", type: sql.Int },
      trimester: { col: "Trimester", type: sql.VarChar(10) },
      pregnancyWeekNumber: { col: "PregnancyWeekNumber", type: sql.Int },
      percentageComplete: { col: "PercentageComplete", type: sql.Decimal(5, 2) },
      status: { col: "Status", type: sql.VarChar(10) },
      doctor: { col: "DoctorID", type: sql.Int },
      midwife: { col: "MidwifeID", type: sql.Int },
    };

    const jsonFields = ["medicalConditions", "allergies", "previousComplications"];

    for (const [key, value] of Object.entries(updateData)) {
      if (jsonFields.includes(key)) {
        const col = key === "medicalConditions" ? "MedicalConditions"
          : key === "allergies" ? "Allergies" : "PreviousComplications";
        setClauses.push(`${col} = @${key}`);
        request.input(key, sql.NVarChar(sql.MAX), JSON.stringify(value));
      } else if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key].col} = @${key}`);
        request.input(key, fieldMap[key].type, value);
      }
    }

    if (setClauses.length === 0) return await this.findById(id);
    setClauses.push("UpdatedAt = GETDATE()");

    await request.query(`UPDATE Pregnancies SET ${setClauses.join(", ")} WHERE PregnancyID = @id`);
    return await this.findById(id);
  }
}
