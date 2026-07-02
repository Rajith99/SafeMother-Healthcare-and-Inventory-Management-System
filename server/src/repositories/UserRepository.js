import bcrypt from "bcrypt";
import { getPool, sql } from "../config/database.js";

export class UserRepository {
  async create(userData) {
    const pool = getPool();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const result = await pool.request()
      .input("fullName", sql.NVarChar(200), userData.fullName)
      .input("email", sql.NVarChar(255), userData.email.toLowerCase())
      .input("contactNumber", sql.VarChar(15), userData.contactNumber)
      .input("address", sql.NVarChar(500), userData.address)
      .input("dateOfBirth", sql.Date, userData.dateOfBirth)
      .input("password", sql.NVarChar(255), hashedPassword)
      .input("role", sql.VarChar(10), userData.role || "MOTHER")
      .input("isActive", sql.Bit, userData.isActive !== undefined ? userData.isActive : true)
      .query(`
        INSERT INTO Users (FullName, Email, ContactNumber, Address, DateOfBirth, Password, Role, IsActive)
        OUTPUT INSERTED.UserID AS _id, INSERTED.FullName AS fullName, INSERTED.Email AS email,
               INSERTED.ContactNumber AS contactNumber, INSERTED.Address AS address,
               INSERTED.DateOfBirth AS dateOfBirth, INSERTED.Role AS role,
               INSERTED.IsActive AS isActive, INSERTED.IsDeleted AS isDeleted,
               INSERTED.CreatedAt AS createdAt, INSERTED.UpdatedAt AS updatedAt
        VALUES (@fullName, @email, @contactNumber, @address, @dateOfBirth, @password, @role, @isActive)
      `);
    return result.recordset[0];
  }

  async findByEmail(email) {
    const pool = getPool();
    const result = await pool.request()
      .input("email", sql.NVarChar(255), email.toLowerCase())
      .query(`
        SELECT UserID AS _id, FullName AS fullName, Email AS email,
               ContactNumber AS contactNumber, Address AS address,
               DateOfBirth AS dateOfBirth, Role AS role,
               IsActive AS isActive, IsDeleted AS isDeleted,
               PasswordResetToken AS passwordResetToken,
               PasswordResetExpires AS passwordResetExpires,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Users WHERE Email = @email AND IsDeleted = 0
      `);
    return result.recordset[0] || null;
  }

  async findById(id) {
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT UserID AS _id, FullName AS fullName, Email AS email,
               ContactNumber AS contactNumber, Address AS address,
               DateOfBirth AS dateOfBirth, Role AS role,
               IsActive AS isActive, IsDeleted AS isDeleted,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Users WHERE UserID = @id AND IsDeleted = 0
      `);
    return result.recordset[0] || null;
  }

  async findByIdWithPassword(id) {
    if (!id) return null;
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT UserID AS _id, FullName AS fullName, Email AS email,
               ContactNumber AS contactNumber, Address AS address,
               DateOfBirth AS dateOfBirth, Password AS password, Role AS role,
               IsActive AS isActive, IsDeleted AS isDeleted,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Users WHERE UserID = @id AND IsDeleted = 0
      `);
    const user = result.recordset[0] || null;
    if (user) {
      user.comparePassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      };
    }
    return user;
  }

  async findByResetToken(hashedToken) {
    const pool = getPool();
    const result = await pool.request()
      .input("token", sql.NVarChar(255), hashedToken)
      .query(`
        SELECT UserID AS _id, FullName AS fullName, Email AS email,
               Password AS password, Role AS role,
               IsActive AS isActive, IsDeleted AS isDeleted,
               PasswordResetToken AS passwordResetToken,
               PasswordResetExpires AS passwordResetExpires
        FROM Users
        WHERE PasswordResetToken = @token
          AND PasswordResetExpires > GETDATE()
          AND IsDeleted = 0
      `);
    const user = result.recordset[0] || null;
    if (user) {
      user.comparePassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      };
    }
    return user;
  }

  async update(id, updateData) {
    const pool = getPool();
    const setClauses = [];
    const request = pool.request().input("id", sql.Int, id);

    const fieldMap = {
      fullName: { col: "FullName", type: sql.NVarChar(200) },
      email: { col: "Email", type: sql.NVarChar(255) },
      contactNumber: { col: "ContactNumber", type: sql.VarChar(15) },
      address: { col: "Address", type: sql.NVarChar(500) },
      isActive: { col: "IsActive", type: sql.Bit },
      isDeleted: { col: "IsDeleted", type: sql.Bit },
      passwordResetToken: { col: "PasswordResetToken", type: sql.NVarChar(255) },
      passwordResetExpires: { col: "PasswordResetExpires", type: sql.DateTime },
    };

    for (const [key, value] of Object.entries(updateData)) {
      if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key].col} = @${key}`);
        request.input(key, fieldMap[key].type, value);
      }
    }

    if (setClauses.length === 0) return await this.findById(id);

    setClauses.push("UpdatedAt = GETDATE()");

    const result = await request.query(`
      UPDATE Users SET ${setClauses.join(", ")} WHERE UserID = @id AND IsDeleted = 0;
      SELECT UserID AS _id, FullName AS fullName, Email AS email,
             ContactNumber AS contactNumber, Address AS address,
             DateOfBirth AS dateOfBirth, Role AS role,
             IsActive AS isActive, IsDeleted AS isDeleted,
             CreatedAt AS createdAt, UpdatedAt AS updatedAt
      FROM Users WHERE UserID = @id;
    `);
    return result.recordset[0] || null;
  }

  async updatePassword(id, newPassword) {
    const pool = getPool();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.request()
      .input("id", sql.Int, id)
      .input("password", sql.NVarChar(255), hashedPassword)
      .query(`UPDATE Users SET Password = @password, UpdatedAt = GETDATE() WHERE UserID = @id AND IsDeleted = 0`);

    return await this.findById(id);
  }

  async findAll(filters = {}, { page = 1, limit = 10, search = "" } = {}) {
    const pool = getPool();
    const request = pool.request();
    const conditions = ["IsDeleted = 0"];

    if (filters.role) {
      conditions.push("Role = @role");
      request.input("role", sql.VarChar(10), filters.role);
    }
    if (filters.isActive !== undefined) {
      conditions.push("IsActive = @isActive");
      request.input("isActive", sql.Bit, filters.isActive);
    }
    if (filters.isDeleted !== undefined) {
      conditions.push("IsDeleted = @isDeleted");
      request.input("isDeleted", sql.Bit, filters.isDeleted);
    }
    if (search) {
      conditions.push("(FullName LIKE @search OR Email LIKE @searchEmail)");
      request.input("search", sql.NVarChar(255), `%${search}%`);
      request.input("searchEmail", sql.NVarChar(255), `${search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;

    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const countResult = await pool.request()
      .input("role_c", sql.VarChar(10), filters.role || null)
      .input("isActive_c", sql.Bit, filters.isActive !== undefined ? filters.isActive : null)
      .input("isDeleted_c", sql.Bit, filters.isDeleted !== undefined ? filters.isDeleted : null)
      .input("search_c", sql.NVarChar(255), search ? `%${search}%` : null)
      .input("searchEmail_c", sql.NVarChar(255), search ? `${search}%` : null)
      .query(`SELECT COUNT(*) AS total FROM Users ${where.replace(/@role/g, '@role_c').replace(/@isActive/g, '@isActive_c').replace(/@isDeleted/g, '@isDeleted_c').replace(/@search\b/g, '@search_c').replace(/@searchEmail/g, '@searchEmail_c')}`);

    const dataResult = await request.query(`
      SELECT UserID AS _id, FullName AS fullName, Email AS email,
             ContactNumber AS contactNumber, Address AS address,
             DateOfBirth AS dateOfBirth, Role AS role,
             IsActive AS isActive, IsDeleted AS isDeleted,
             CreatedAt AS createdAt, UpdatedAt AS updatedAt
      FROM Users ${where}
      ORDER BY CreatedAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    return {
      users: dataResult.recordset,
      total: countResult.recordset[0].total,
      page,
      limit,
    };
  }

  async searchActiveByRole(role, search = "", limit = 10) {
    const pool = getPool();
    const request = pool.request()
      .input("role", sql.VarChar(10), role)
      .input("limit", sql.Int, limit);

    let searchCondition = "";
    if (search.trim()) {
      searchCondition = "AND FullName LIKE @search";
      request.input("search", sql.NVarChar(255), `%${search.trim()}%`);
    }

    const result = await request.query(`
      SELECT TOP (@limit) UserID AS _id, FullName AS fullName, Email AS email, Role AS role, IsActive AS isActive
      FROM Users
      WHERE Role = @role AND IsActive = 1 AND IsDeleted = 0 ${searchCondition}
      ORDER BY FullName ASC
    `);
    return result.recordset;
  }

  async delete(id) {
    const pool = getPool();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE Users SET IsDeleted = 1, IsActive = 0, UpdatedAt = GETDATE() WHERE UserID = @id;
        SELECT UserID AS _id, FullName AS fullName, Email AS email,
               ContactNumber AS contactNumber, Address AS address,
               DateOfBirth AS dateOfBirth, Role AS role,
               IsActive AS isActive, IsDeleted AS isDeleted,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Users WHERE UserID = @id;
      `);
    return result.recordset[0] || null;
  }
}
