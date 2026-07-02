import { getPool, sql } from "../config/database.js";

export class ChatRepository {
  
  async _populateChat(chatId) {
    const pool = getPool();
    const chatResult = await pool.request()
      .input("chatId", sql.Int, chatId)
      .query(`
        SELECT ChatID AS _id, PregnancyID AS pregnancyId, IsReadOnly AS isReadOnly,
               LastMessage AS lastMessage, LastMessageAt AS lastMessageAt,
               CreatedAt AS createdAt, UpdatedAt AS updatedAt
        FROM Chats WHERE ChatID = @chatId
      `);
    const chat = chatResult.recordset[0];
    if (!chat) return null;

    const participantsResult = await pool.request()
      .input("chatId", sql.Int, chatId)
      .query(`
        SELECT u.UserID AS _id, u.FullName AS fullName, u.Email AS email,
               u.Role AS role, u.IsActive AS isActive
        FROM ChatParticipants cp
        INNER JOIN Users u ON cp.UserID = u.UserID
        WHERE cp.ChatID = @chatId
      `);
    chat.participants = participantsResult.recordset;
    return chat;
  }

  
  async create(participantIds) {
    const pool = getPool();
    const result = await pool.request()
      .query(`
        INSERT INTO Chats (PregnancyID) OUTPUT INSERTED.ChatID AS _id VALUES (NULL)
      `);
    const chatId = result.recordset[0]._id;

    for (const userId of participantIds) {
      await pool.request()
        .input("chatId", sql.Int, chatId)
        .input("userId", sql.Int, userId)
        .query(`INSERT INTO ChatParticipants (ChatID, UserID) VALUES (@chatId, @userId)`);
    }
    return await this._populateChat(chatId);
  }

  
  async findByPregnancyAndUsers(pregnancyId, userIdA, userIdB) {
    const pool = getPool();
    const result = await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .input("userIdA", sql.Int, userIdA)
      .input("userIdB", sql.Int, userIdB)
      .query(`
        SELECT c.ChatID
        FROM Chats c
        INNER JOIN ChatParticipants cpA ON c.ChatID = cpA.ChatID AND cpA.UserID = @userIdA
        INNER JOIN ChatParticipants cpB ON c.ChatID = cpB.ChatID AND cpB.UserID = @userIdB
        WHERE c.PregnancyID = @pregnancyId AND c.IsReadOnly = 0
          AND (SELECT COUNT(*) FROM ChatParticipants WHERE ChatID = c.ChatID) = 2
      `);
    if (result.recordset.length === 0) return null;
    return await this._populateChat(result.recordset[0].ChatID);
  }

  
  async createWithPregnancy(pregnancyId, participantIds) {
    const pool = getPool();
    const result = await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .query(`
        INSERT INTO Chats (PregnancyID, LastMessageAt)
        OUTPUT INSERTED.ChatID AS _id
        VALUES (@pregnancyId, GETDATE())
      `);
    const chatId = result.recordset[0]._id;

    for (const userId of participantIds) {
      await pool.request()
        .input("chatId", sql.Int, chatId)
        .input("userId", sql.Int, userId)
        .query(`INSERT INTO ChatParticipants (ChatID, UserID) VALUES (@chatId, @userId)`);
    }
    return await this._populateChat(chatId);
  }

  
  async setReadOnlyByPregnancy(pregnancyId) {
    const pool = getPool();
    await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .query(`UPDATE Chats SET IsReadOnly = 1, UpdatedAt = GETDATE() WHERE PregnancyID = @pregnancyId`);
  }

  
  async setReadOnlyByPregnancyAndUsers(pregnancyId, userIdA, userIdB) {
    const pool = getPool();
    await pool.request()
      .input("pregnancyId", sql.Int, pregnancyId)
      .input("userIdA", sql.Int, userIdA)
      .input("userIdB", sql.Int, userIdB)
      .query(`
        UPDATE Chats SET IsReadOnly = 1, UpdatedAt = GETDATE()
        WHERE PregnancyID = @pregnancyId AND ChatID IN (
          SELECT c.ChatID FROM Chats c
          INNER JOIN ChatParticipants cpA ON c.ChatID = cpA.ChatID AND cpA.UserID = @userIdA
          INNER JOIN ChatParticipants cpB ON c.ChatID = cpB.ChatID AND cpB.UserID = @userIdB
          WHERE c.PregnancyID = @pregnancyId
            AND (SELECT COUNT(*) FROM ChatParticipants WHERE ChatID = c.ChatID) = 2
        )
      `);
  }

  
  async findByUserId(userId) {
    const pool = getPool();
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT DISTINCT c.ChatID
        FROM Chats c
        INNER JOIN ChatParticipants cp ON c.ChatID = cp.ChatID
        WHERE cp.UserID = @userId
        ORDER BY c.ChatID DESC
      `);

    const chats = [];
    for (const row of result.recordset) {
      const chat = await this._populateChat(row.ChatID);
      if (chat) chats.push(chat);
    }
    
    chats.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    return chats;
  }

  
  async findById(chatId) {
    return await this._populateChat(chatId);
  }

  
  async updateLastMessage(chatId, text, date = new Date()) {
    const pool = getPool();
    await pool.request()
      .input("chatId", sql.Int, chatId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("date", sql.DateTime, date)
      .query(`UPDATE Chats SET LastMessage = @text, LastMessageAt = @date, UpdatedAt = GETDATE() WHERE ChatID = @chatId`);
    return await this._populateChat(chatId);
  }
}
