import { getPool, sql } from "../config/database.js";

export class AppointmentRepository {
  
  _parseArrayField(value) {
    if (!value) return [];
    try { return JSON.parse(value); } catch { return []; }
  }

  
  _formatPopulatedRow(row) {
    if (!row) return null;
    return {
      _id: row._id,
      pregnancy: row["pregnancy._id"] ? {
        _id: row["pregnancy._id"],
        status: row["pregnancy.status"],
        doctor: row["pregnancy.doctor"] || null,
        midwife: row["pregnancy.midwife"] || null,
        user: row["pregnancy.user"] || null,
      } : row.pregnancyId,
      mother: row["mother._id"] ? {
        _id: row["mother._id"],
        fullName: row["mother.fullName"],
        email: row["mother.email"],
        contactNumber: row["mother.contactNumber"],
      } : null,
      midwife: row["midwife._id"] ? {
        _id: row["midwife._id"],
        fullName: row["midwife.fullName"],
        email: row["midwife.email"],
        contactNumber: row["midwife.contactNumber"],
      } : null,
      appointmentDate: row.appointmentDate,
      preferredDateTime: row.preferredDateTime,
      confirmedDateTime: row.confirmedDateTime,
      status: row.status,
      rejectionReason: row.rejectionReason,
      rescheduleReason: row.rescheduleReason,
      pulseRate: row.pulseRate,
      temperature: row.temperature,
      bloodPressure: row.bloodPressure,
      specialMedicalConditions: this._parseArrayField(row.specialMedicalConditions),
      appointmentNotes: row.appointmentNotes,
      isCompleted: row.isCompleted,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  _populatedQuery() {
    return `
      SELECT a.AppointmentID AS _id,
             a.AppointmentDate AS appointmentDate, a.PreferredDateTime AS preferredDateTime,
             a.ConfirmedDateTime AS confirmedDateTime, a.Status AS status,
             a.RejectionReason AS rejectionReason, a.RescheduleReason AS rescheduleReason,
             a.PulseRate AS pulseRate, a.Temperature AS temperature,
             a.BloodPressure AS bloodPressure,
             a.SpecialMedicalConditions AS specialMedicalConditions,
             a.AppointmentNotes AS appointmentNotes,
             a.IsCompleted AS isCompleted, a.CompletedAt AS completedAt,
             a.CreatedAt AS createdAt, a.UpdatedAt AS updatedAt,
             -- Pregnancy
             p.PregnancyID AS [pregnancy._id], p.Status AS [pregnancy.status],
             p.DoctorID AS [pregnancy.doctor], p.MidwifeID AS [pregnancy.midwife],
             p.UserID AS [pregnancy.user],
             -- Mother
             um.UserID AS [mother._id], um.FullName AS [mother.fullName],
             um.Email AS [mother.email], um.ContactNumber AS [mother.contactNumber],
             -- Midwife
             uw.UserID AS [midwife._id], uw.FullName AS [midwife.fullName],
             uw.Email AS [midwife.email], uw.ContactNumber AS [midwife.contactNumber]
      FROM Appointments a
      INNER JOIN Pregnancies p ON a.PregnancyID = p.PregnancyID
      INNER JOIN Users um ON a.MotherID = um.UserID
      INNER JOIN Users uw ON a.MidwifeID = uw.UserID
    `;
  }

  async create(data) {
    const pool = getPool();
    const result = await pool.request()
      .input("pregnancyId", sql.Int, data.pregnancy)
      .input("motherId", sql.Int, data.mother)
      .input("midwifeId", sql.Int, data.midwife)
      .input("appointmentDate", sql.DateTime, data.appointmentDate)
      .input("preferredDateTime", sql.DateTime, data.preferredDateTime)
      .input("confirmedDateTime", sql.DateTime, data.confirmedDateTime || null)
      .input("status", sql.VarChar(25), data.status || "PENDING")
      .input("rejectionReason", sql.NVarChar(500), data.rejectionReason || null)
      .input("rescheduleReason", sql.NVarChar(500), data.rescheduleReason || null)
      .query(`
        INSERT INTO Appointments (PregnancyID, MotherID, MidwifeID, AppointmentDate,
          PreferredDateTime, ConfirmedDateTime, Status, RejectionReason, RescheduleReason)
        OUTPUT INSERTED.AppointmentID AS _id
        VALUES (@pregnancyId, @motherId, @midwifeId, @appointmentDate,
          @preferredDateTime, @confirmedDateTime, @status, @rejectionReason, @rescheduleReason)
      `);
    return await this.findById(result.recordset[0]._id);
  }

  async findById(id) {
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`${this._populatedQuery()} WHERE a.AppointmentID = @id`);
    return this._formatPopulatedRow(result.recordset[0]);
  }

  async findByIdBasic(id) {
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT AppointmentID AS _id, PregnancyID AS pregnancy,
               MotherID AS mother, MidwifeID AS midwife,
               AppointmentDate AS appointmentDate, PreferredDateTime AS preferredDateTime,
               ConfirmedDateTime AS confirmedDateTime, Status AS status,
               RejectionReason AS rejectionReason, RescheduleReason AS rescheduleReason,
               PulseRate AS pulseRate, Temperature AS temperature,
               BloodPressure AS bloodPressure,
               SpecialMedicalConditions AS specialMedicalConditions,
               AppointmentNotes AS appointmentNotes,
               IsCompleted AS isCompleted, CompletedAt AS completedAt,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Appointments WHERE AppointmentID = @id
      `);
    const row = result.recordset[0];
    if (!row) return null;
    row.specialMedicalConditions = this._parseArrayField(row.specialMedicalConditions);
    return row;
  }

  async update(id, updateData) {
    const pool = getPool();
    const setClauses = [];
    const request = pool.request().input("id", sql.Int, id);

    const fieldMap = {
      status: { col: "Status", type: sql.VarChar(25) },
      confirmedDateTime: { col: "ConfirmedDateTime", type: sql.DateTime },
      appointmentDate: { col: "AppointmentDate", type: sql.DateTime },
      preferredDateTime: { col: "PreferredDateTime", type: sql.DateTime },
      rejectionReason: { col: "RejectionReason", type: sql.NVarChar(500) },
      rescheduleReason: { col: "RescheduleReason", type: sql.NVarChar(500) },
      pulseRate: { col: "PulseRate", type: sql.Decimal(6, 2) },
      temperature: { col: "Temperature", type: sql.Decimal(5, 2) },
      bloodPressure: { col: "BloodPressure", type: sql.VarChar(20) },
      appointmentNotes: { col: "AppointmentNotes", type: sql.NVarChar(sql.MAX) },
      isCompleted: { col: "IsCompleted", type: sql.Bit },
      completedAt: { col: "CompletedAt", type: sql.DateTime },
    };

    for (const [key, value] of Object.entries(updateData)) {
      if (key === "specialMedicalConditions") {
        setClauses.push("SpecialMedicalConditions = @specialMedicalConditions");
        request.input("specialMedicalConditions", sql.NVarChar(sql.MAX), JSON.stringify(value));
      } else if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key].col} = @${key}`);
        request.input(key, fieldMap[key].type, value);
      }
    }

    if (setClauses.length === 0) return await this.findById(id);
    setClauses.push("UpdatedAt = GETDATE()");

    await request.query(`UPDATE Appointments SET ${setClauses.join(", ")} WHERE AppointmentID = @id`);
    return await this.findById(id);
  }

  async findByPregnancyId(pregnancyId) {
    const pool = getPool();
    const result = await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .query(`${this._populatedQuery()} WHERE a.PregnancyID = @pregnancyId ORDER BY a.AppointmentDate ASC`);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async findByPregnancyIds(pregnancyIds) {
    if (!pregnancyIds || pregnancyIds.length === 0) return [];
    const pool = getPool();
    const idList = pregnancyIds.join(",");
    const result = await pool.request()
      .query(`${this._populatedQuery()} WHERE a.PregnancyID IN (${idList}) ORDER BY a.AppointmentDate ASC`);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async findByMotherId(motherId) {
    const pool = getPool();
    const result = await pool.request()
      .input("motherId", sql.Int, motherId)
      .query(`${this._populatedQuery()} WHERE a.MotherID = @motherId ORDER BY a.CreatedAt DESC`);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async findByMidwifeId(midwifeId) {
    const pool = getPool();
    const result = await pool.request()
      .input("midwifeId", sql.Int, midwifeId)
      .query(`${this._populatedQuery()} WHERE a.MidwifeID = @midwifeId ORDER BY a.AppointmentDate ASC`);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async findPendingByMotherAndPregnancy(motherId, pregnancyId) {
    const pool = getPool();
    const result = await pool.request()
      .input("motherId", sql.Int, motherId)
      .input("pregnancyId", sql.Int, pregnancyId)
      .query(`${this._populatedQuery()} WHERE a.MotherID = @motherId AND a.PregnancyID = @pregnancyId AND a.Status = 'PENDING'`);
    return this._formatPopulatedRow(result.recordset[0]);
  }

  async findActiveByMotherAndPregnancy(motherId, pregnancyId) {
    const pool = getPool();
    const result = await pool.request()
      .input("motherId", sql.Int, motherId)
      .input("pregnancyId", sql.Int, pregnancyId)
      .query(`
        ${this._populatedQuery()}
        WHERE a.MotherID = @motherId AND a.PregnancyID = @pregnancyId
          AND a.Status IN ('PENDING', 'RESCHEDULE_REQUESTED', 'APPROVED', 'CONFIRMED')
          AND a.IsCompleted = 0
      `);
    return this._formatPopulatedRow(result.recordset[0]);
  }

  async findUpcomingByMidwife(midwifeId) {
    const pool = getPool();
    const result = await pool.request()
      .input("midwifeId", sql.Int, midwifeId)
      .query(`
        ${this._populatedQuery()}
        WHERE a.MidwifeID = @midwifeId AND a.AppointmentDate >= GETDATE()
          AND a.Status = 'CONFIRMED' AND a.IsCompleted = 0
        ORDER BY a.AppointmentDate ASC
      `);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async findCompletedByMidwife(midwifeId) {
    const pool = getPool();
    const result = await pool.request()
      .input("midwifeId", sql.Int, midwifeId)
      .query(`
        ${this._populatedQuery()}
        WHERE a.MidwifeID = @midwifeId AND a.IsCompleted = 1
        ORDER BY a.CompletedAt DESC
      `);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async findByStatusAndPregnancy(pregnancyId, status) {
    const pool = getPool();
    const result = await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .input("status", sql.VarChar(25), status)
      .query(`${this._populatedQuery()} WHERE a.PregnancyID = @pregnancyId AND a.Status = @status`);
    return result.recordset.map(r => this._formatPopulatedRow(r));
  }

  async delete(id) {
    const pool = getPool();
    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Appointments WHERE AppointmentID = @id`);
  }
}
