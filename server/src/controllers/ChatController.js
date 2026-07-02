import { ChatService } from "../services/ChatService.js";

export class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  
  getMyChats = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const chats = await this.chatService.getMyChats(userId);

      return res.status(200).json({
        success: true,
        message: "Chats retrieved successfully",
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  };

  
  getChatById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requesterId = req.user.userId;

      const chat = await this.chatService.getChatById(id, requesterId);

      return res.status(200).json({
        success: true,
        message: "Chat retrieved successfully",
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  };
}
