import express from "express";
import { UserController } from "../controllers/UserController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = express.Router();
const userController = new UserController();


router.get("/", authenticate, authorize("ADMIN"), userController.getAllUsers);


router.get(
  "/pending-validation",
  authenticate,
  authorize("ADMIN"),
  userController.getPendingValidation,
);


router.patch(
  "/:userId/activate",
  authenticate,
  authorize("ADMIN"),
  userController.activateUser,
);


router.patch(
  "/:userId/deactivate",
  authenticate,
  authorize("ADMIN"),
  userController.deactivateUser,
);


router.get(
  "/doctors/search",
  authenticate,
  authorize("MOTHER", "ADMIN"),
  userController.searchDoctors,
);


router.get(
  "/midwives/search",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  userController.searchMidwives,
);


router.get("/:userId", authenticate, requireOwner, userController.getUserById);


router.patch("/:userId", authenticate, requireOwner, userController.updateUser);


router.patch(
  "/:userId/change-password",
  authenticate,
  requireOwner,
  userController.changePassword,
);


router.delete(
  "/:userId",
  authenticate,
  requireOwner,
  userController.deleteUser,
);


router.delete(
  "/:userId/admin-delete",
  authenticate,
  authorize("ADMIN"),
  userController.adminDeleteUser,
);

export default router;
