import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireActiveDoctorMidwife } from "../middlewares/requireActiveDoctorMidwife.js";
import { AppointmentController } from "../controllers/AppointmentController.js";

const router = express.Router();
const appointmentController = new AppointmentController();


router.use(authenticate);


router.get(
  "/",
  authorize("MOTHER", "MIDWIFE", "DOCTOR"),
  requireActiveDoctorMidwife,
  appointmentController.list,
);


router.use(authorize("MOTHER", "MIDWIFE"), requireActiveDoctorMidwife);


router.post("/", appointmentController.create);


 
 
router.get("/upcoming/mine", appointmentController.getUpcoming);


 
 
router.get("/completed/mine", appointmentController.getCompleted);


 
 
router.get("/pregnancy/:pregnancyId", appointmentController.getByPregnancy);


router.post("/:id/ai-check", appointmentController.aiCheck);


 
  
 
router.get("/:id", appointmentController.getById);


 
 
router.patch("/:id/respond", appointmentController.respond);


 
 

 
router.patch("/:id/mother-response", appointmentController.motherResponse);


 

router.patch("/:id/fill-info", appointmentController.fillInfo);


 

 
router.patch("/:id/cancel", appointmentController.cancel);


router.delete("/:id", appointmentController.deleteByMother);

export default router;
