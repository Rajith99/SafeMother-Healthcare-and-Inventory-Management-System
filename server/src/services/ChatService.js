import { ChatRepository } from "../repositories/ChatRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const chatRepository = new ChatRepository();
const userRepository = new UserRepository();

export class ChatService {
  




  async createPregnancyChat(pregnancyId, userIdA, userIdB) {
    
    const [userA, userB] = await Promise.all([
      userRepository.findById(userIdA),
      userRepository.findById(userIdB),
    ]);

    if (!userA || !userB) {
      const error = new Error("One or both users not found");
      error.statusCode = 404;
      throw error;
    }

    if (!userA.isActive || !userB.isActive) {
      const error = new Error("Both users must have active accounts");
      error.statusCode = 403;
      throw error;
    }

    
    const existing = await chatRepository.findByPregnancyAndUsers(
      pregnancyId,
      userIdA,
      userIdB,
    );
    if (existing) {
      return { chat: existing, created: false };
    }

    const chat = await chatRepository.createWithPregnancy(pregnancyId, [
      userIdA,
      userIdB,
    ]);
    
    const populated = await chatRepository.findById(chat._id);
    return { chat: populated, created: true };
  }

  



  async deactivateChatsForPregnancy(pregnancyId) {
    return await chatRepository.setReadOnlyByPregnancy(pregnancyId);
  }

  



  async deactivateChatBetween(pregnancyId, userIdA, userIdB) {
    return await chatRepository.setReadOnlyByPregnancyAndUsers(pregnancyId, userIdA, userIdB);
  }

  
  async getMyChats(userId) {
    return await chatRepository.findByUserId(userId);
  }

  
  async getChatById(chatId, requesterId) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    const isParticipant = chat.participants.some(
      (p) => p._id === requesterId,
    );

    if (!isParticipant) {
      const error = new Error("Access denied. You are not part of this chat");
      error.statusCode = 403;
      throw error;
    }

    return chat;
  }
}
