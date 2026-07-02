import { getPool, sql } from "../config/database.js";

export class MessageRepository {
  
  async create(chatId, senderId, text) {
    const pool = getPool();
    const result = await pool.request()
      .input("chatId", sql.Int, chatId)
      .input("senderId", sql.Int, senderId)
      .input("text", sql.NVarChar(2000), text)
      .query(`
        INSERT INTO Messages (ChatID, SenderID, Text)
        OUTPUT INSERTED.MessageID AS _id, INSERTED.ChatID AS chatId,
               INSERTED.SenderID AS senderId, INSERTED.Text AS text,
               INSERTED.IsRead AS isRead, INSERTED.ReadAt AS readAt,
               INSERTED.IsDeleted AS isDeleted,
               INSERTED.CreatedAt AS createdAt, INSERTED.UpdatedAt AS updatedAt
        VALUES (@chatId, @senderId, @text)
      `);
    return result.recordset[0];
  }

  
  async findByChatId(chatId, page = 1, limit = 20) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    const countResult = await pool.request()
      .input("chatId", sql.Int, chatId)
      .query(`SELECT COUNT(*) AS total FROM Messages WHERE ChatID = @chatId AND IsDeleted = 0`);

    const total = countResult.recordset[0].total;

    const result = await pool.request()
      .input("chatId", sql.Int, chatId)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit)
      .query(`
        SELECT m.MessageID AS _id, m.ChatID AS chatId, m.Text AS text,
               m.IsRead AS isRead, m.ReadAt AS readAt, m.IsDeleted AS isDeleted,
               m.CreatedAt AS createdAt, m.UpdatedAt AS updatedAt,
               u.UserID AS [senderId._id], u.FullName AS [senderId.fullName],
               u.Email AS [senderId.email], u.Role AS [senderId.role]
        FROM Messages m
        INNER JOIN Users u ON m.SenderID = u.UserID
        WHERE m.ChatID = @chatId AND m.IsDeleted = 0
        ORDER BY m.CreatedAt ASC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const messages = result.recordset.map(row => ({
      _id: row._id,
      chatId: row.chatId,
      senderId: {
        _id: row["senderId._id"],
        fullName: row["senderId.fullName"],
        email: row["senderId.email"],
        role: row["senderId.role"],
      },
      text: row.text,
      isRead: row.isRead,
      readAt: row.readAt,
      isDeleted: row.isDeleted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  
  async findById(messageId) {
    const pool = getPool();
    const result = await pool.request()
      .input("messageId", sql.Int, messageId)
      .query(`
        SELECT m.MessageID AS _id, m.ChatID AS chatId, m.Text AS text,
               m.IsRead AS isRead, m.ReadAt AS readAt, m.IsDeleted AS isDeleted,
               m.CreatedAt AS createdAt, m.UpdatedAt AS updatedAt,
               u.UserID AS [senderId._id], u.FullName AS [senderId.fullName],
               u.Email AS [senderId.email], u.Role AS [senderId.role]
        FROM Messages m
        INNER JOIN Users u ON m.SenderID = u.UserID
        WHERE m.MessageID = @messageId
      `);
    const row = result.recordset[0];
    if (!row) return null;
    return {
      _id: row._id,
      chatId: row.chatId,
      senderId: {
        _id: row["senderId._id"],
        fullName: row["senderId.fullName"],
        email: row["senderId.email"],
        role: row["senderId.role"],
      },
      text: row.text,
      isRead: row.isRead,
      readAt: row.readAt,
      isDeleted: row.isDeleted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  
  async markAsRead(messageId) {
    const pool = getPool();
    await pool.request()
      .input("messageId", sql.Int, messageId)
      .query(`UPDATE Messages SET IsRead = 1, ReadAt = GETDATE(), UpdatedAt = GETDATE() WHERE MessageID = @messageId`);
    return await this.findById(messageId);
  }

  
  async markAllAsRead(chatId, recipientId) {
    const pool = getPool();
    await pool.request()
      .input("chatId", sql.Int, chatId)
      .input("recipientId", sql.Int, recipientId)
      .query(`
        UPDATE Messages SET IsRead = 1, ReadAt = GETDATE(), UpdatedAt = GETDATE()
        WHERE ChatID = @chatId AND SenderID != @recipientId AND IsRead = 0
      `);
  }

  
  async softDelete(messageId) {
    const pool = getPool();
    await pool.request()
      .input("messageId", sql.Int, messageId)
      .query(`UPDATE Messages SET IsDeleted = 1, UpdatedAt = GETDATE() WHERE MessageID = @messageId`);
    return await this.findById(messageId);
  }

  
  async findLatestInChat(chatId) {
    const pool = getPool();
    const result = await pool.request()
      .input("chatId", sql.Int, chatId)
      .query(`
        SELECT TOP 1 MessageID AS _id, ChatID AS chatId, Text AS text,
               CreatedAt AS createdAt
        FROM Messages
        WHERE ChatID = @chatId AND IsDeleted = 0
        ORDER BY CreatedAt DESC
      `);
    return result.recordset[0] || null;
  }
}
