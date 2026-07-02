import express from "express";
import { MessageController } from "../controllers/MessageController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireActiveDoctorMidwife } from "../middlewares/requireActiveDoctorMidwife.js";
import {
  sendMessageValidator,
  getMessagesValidator,
  markReadValidator,
  deleteMessageValidator,
} from "../validators/chatValidators.js";
import { validateRequest } from "../validators/validateRequest.js";

const router = express.Router();
const messageController = new MessageController();


router.use(authenticate, authorize("MOTHER", "DOCTOR", "MIDWIFE"), requireActiveDoctorMidwife);


router.post(
  "/",
  sendMessageValidator,
  validateRequest,
  messageController.sendMessage,
);


router.get(
  "/:chatId",
  getMessagesValidator,
  validateRequest,
  messageController.getMessages,
);


router.put(
  "/read/:id",
  markReadValidator,
  validateRequest,
  messageController.markMessageRead,
);


router.delete(
  "/:id",
  deleteMessageValidator,
  validateRequest,
  messageController.deleteMessage,
);

export default router;
