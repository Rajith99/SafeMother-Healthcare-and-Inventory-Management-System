import { getPool, sql } from "../config/database.js";

export class AnalyticsService {
  async getSystemStats() {
    const userStats = await this._getUserStats();
    const pregnancyStats = await this._getPregnancyStats();
    const appointmentStats = await this._getAppointmentStats();
    const chatStats = await this._getChatStats();

    return { userStats, pregnancyStats, appointmentStats, chatStats };
  }

  async _getUserStats() {
    const pool = getPool();

    const roleResult = await pool.request().query(`
      SELECT Role AS role, COUNT(*) AS total,
             SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS active,
             SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS inactive
      FROM Users WHERE IsDeleted = 0
      GROUP BY Role
    `);

    const byRole = { MOTHER: 0, DOCTOR: 0, MIDWIFE: 0, ADMIN: 0 };
    const activeByRole = { MOTHER: 0, DOCTOR: 0, MIDWIFE: 0, ADMIN: 0 };
    let totalActive = 0;
    let totalInactive = 0;
    let total = 0;

    for (const row of roleResult.recordset) {
      byRole[row.role] = row.total;
      activeByRole[row.role] = row.active;
      totalActive += row.active;
      totalInactive += row.inactive;
      total += row.total;
    }

    const pendingResult = await pool.request().query(`
      SELECT COUNT(*) AS cnt FROM Users
      WHERE IsDeleted = 0 AND IsActive = 0 AND Role IN ('DOCTOR', 'MIDWIFE')
    `);
    const pendingValidation = pendingResult.recordset[0].cnt;

    const newUsersResult = await pool.request().query(`
      SELECT COUNT(*) AS cnt FROM Users
      WHERE IsDeleted = 0 AND CreatedAt >= DATEADD(day, -30, GETDATE())
    `);
    const newUsersLast30Days = newUsersResult.recordset[0].cnt;

    return {
      total,
      byRole,
      activeByRole,
      totalActive,
      totalInactive,
      pendingValidation,
      newUsersLast30Days,
    };
  }

  async _getPregnancyStats() {
    const pool = getPool();

    const statusResult = await pool.request().query(`
      SELECT Status AS status, COUNT(*) AS count
      FROM Pregnancies GROUP BY Status
    `);
    const byStatus = { ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const row of statusResult.recordset) {
      if (byStatus[row.status] !== undefined) byStatus[row.status] = row.count;
    }

    const trimesterResult = await pool.request().query(`
      SELECT Trimester AS trimester, COUNT(*) AS count
      FROM Pregnancies
      WHERE Status = 'ACTIVE' AND Trimester IS NOT NULL
      GROUP BY Trimester
    `);
    const byTrimester = { FIRST: 0, SECOND: 0, THIRD: 0 };
    for (const row of trimesterResult.recordset) {
      if (byTrimester[row.trimester] !== undefined) byTrimester[row.trimester] = row.count;
    }

    const unassignedResult = await pool.request().query(`
      SELECT COUNT(*) AS cnt FROM Pregnancies
      WHERE Status = 'ACTIVE' AND DoctorID IS NULL
    `);
    const unassignedDoctor = unassignedResult.recordset[0].cnt;

    const total = (byStatus.ACTIVE ?? 0) + (byStatus.COMPLETED ?? 0) + (byStatus.CANCELLED ?? 0);

    return { total, byStatus, byTrimester, unassignedDoctor };
  }

  async _getAppointmentStats() {
    const pool = getPool();

    const statusResult = await pool.request().query(`
      SELECT Status AS status, COUNT(*) AS count
      FROM Appointments GROUP BY Status
    `);
    const byStatus = {
      PENDING: 0, APPROVED: 0, REJECTED: 0,
      CONFIRMED: 0, RESCHEDULE_REQUESTED: 0, CANCELLED: 0,
    };
    for (const row of statusResult.recordset) {
      if (byStatus[row.status] !== undefined) byStatus[row.status] = row.count;
    }

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    const completedResult = await pool.request().query(`
      SELECT COUNT(*) AS cnt FROM Appointments WHERE IsCompleted = 1
    `);
    const completed = completedResult.recordset[0].cnt;

    return { total, byStatus, completed };
  }

  async _getChatStats() {
    const pool = getPool();
    const result = await pool.request().query(`SELECT COUNT(*) AS cnt FROM Chats`);
    return { totalChats: result.recordset[0].cnt };
  }
}
