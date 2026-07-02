import { MessageRepository } from "../repositories/MessageRepository.js";
import { ChatRepository } from "../repositories/ChatRepository.js";

const messageRepository = new MessageRepository();
const chatRepository = new ChatRepository();

export class MessageService {
  
  async sendMessage(chatId, senderId, text) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    const isParticipant = chat.participants.some(
      (p) => p._id === senderId,
    );

    if (!isParticipant) {
      const error = new Error(
        "Access denied. You are not a participant of this chat",
      );
      error.statusCode = 403;
      throw error;
    }

    
    if (chat.isReadOnly) {
      const error = new Error(
        "This conversation is read-only because the pregnancy has ended",
      );
      error.statusCode = 403;
      throw error;
    }

    const midwife = chat.participants.find((p) => p.role === "MIDWIFE");
    if (midwife && !midwife.isActive) {
      const error = new Error(
        "Cannot send message: the midwife's account is not active",
      );
      error.statusCode = 403;
      throw error;
    }

    const message = await messageRepository.create(chatId, senderId, text);

    
    await chatRepository.updateLastMessage(chatId, text);

    return message;
  }

  
  async getMessages(chatId, requesterId, page, limit) {
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
      const error = new Error(
        "Access denied. You are not a participant of this chat",
      );
      error.statusCode = 403;
      throw error;
    }

    return await messageRepository.findByChatId(chatId, page, limit);
  }

  
  async markMessageRead(messageId, requesterId) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      const error = new Error("Message not found");
      error.statusCode = 404;
      throw error;
    }

    if (message.senderId._id === requesterId) {
      const error = new Error("You cannot mark your own message as read");
      error.statusCode = 400;
      throw error;
    }

    if (message.isRead) {
      return message; 
    }

    return await messageRepository.markAsRead(messageId);
  }

  
  async deleteMessage(messageId, requesterId) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      const error = new Error("Message not found");
      error.statusCode = 404;
      throw error;
    }

    if (message.isDeleted) {
      const error = new Error("Message already deleted");
      error.statusCode = 400;
      throw error;
    }

    if (message.senderId._id !== requesterId) {
      const error = new Error("You can only delete your own messages");
      error.statusCode = 403;
      throw error;
    }

    const deleted = await messageRepository.softDelete(messageId);

    
    const chat = await chatRepository.findById(message.chatId);
    if (chat && chat.lastMessage === message.text) {
      const previous = await messageRepository.findLatestInChat(message.chatId);
      await chatRepository.updateLastMessage(
        message.chatId,
        previous ? previous.text : null,
        previous ? previous.createdAt : null,
      );
    }

    return deleted;
  }
}
