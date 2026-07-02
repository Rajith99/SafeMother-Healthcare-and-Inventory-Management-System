import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { PregnancyController } from "../controllers/PregnancyController.js";

const router = express.Router();
const pregnancyController = new PregnancyController();


router.post("/", authenticate, pregnancyController.create);


router.get("/", authenticate, pregnancyController.listByUser);


router.get("/:id", authenticate, pregnancyController.getById);


router.post(
  "/:id/assign-doctor",
  authenticate,
  pregnancyController.assignDoctor,
);


router.post(
  "/:id/assign-midwife",
  authenticate,
  pregnancyController.assignMidwife,
);


router.patch("/:id/cancel", authenticate, pregnancyController.cancel);


router.patch("/:id", authenticate, pregnancyController.update);

export default router;
