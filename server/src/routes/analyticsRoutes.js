import express from "express";
import { AnalyticsController } from "../controllers/AnalyticsController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
const analyticsController = new AnalyticsController();


router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  analyticsController.getStats,
);

export default router;
