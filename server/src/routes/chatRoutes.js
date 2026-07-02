import express from "express";
import { ChatController } from "../controllers/ChatController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireActiveDoctorMidwife } from "../middlewares/requireActiveDoctorMidwife.js";

const router = express.Router();
const chatController = new ChatController();



router.use(
  authenticate,
  authorize("MOTHER", "DOCTOR", "MIDWIFE"),
  requireActiveDoctorMidwife,
);


router.get("/my", chatController.getMyChats);


router.get("/:id", chatController.getChatById);

export default router;
