import { MessageService } from "../services/MessageService.js";

export class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  
  sendMessage = async (req, res, next) => {
    try {
      const senderId = req.user.userId;
      const { chatId, text } = req.body;

      const message = await this.messageService.sendMessage(chatId, senderId, text);

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  
  getMessages = async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const requesterId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.messageService.getMessages(
        chatId,
        requesterId,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  
  markMessageRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requesterId = req.user.userId;

      const message = await this.messageService.markMessageRead(id, requesterId);

      return res.status(200).json({
        success: true,
        message: "Message marked as read",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  
  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requesterId = req.user.userId;

      const message = await this.messageService.deleteMessage(id, requesterId);

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };
}
