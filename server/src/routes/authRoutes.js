import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { connectDB, sql } from "../config/database.js";

const router = express.Router();
const authController = new AuthController();


router.post("/register", authController.register);



router.post("/seed", async (req, res, next) => {
  try {
    const userRepository = new UserRepository();
    const users = [
      {
        fullName: "Admin User",
        email: "admin@safemother.com",
        contactNumber: "0771111111",
        address: "123 Main St, Colombo",
        dateOfBirth: "1990-01-01",
        password: "Password123!",
        role: "ADMIN",
        isActive: true,
      }
    ];

    const doctorNames = [
      "Dr Alice Smith", "Dr Bob Johnson", "Dr Carol Williams", "Dr David Brown", "Dr Eva Davis",
      "Dr Frank Miller", "Dr Grace Wilson", "Dr Henry Moore", "Dr Irene Taylor", "Dr Jack Anderson"
    ];
    const midwifeNames = [
      "Clara Barton", "Florence Nightingale", "Mary Breckinridge", "Edith Cavell", "Margaret Sanger",
      "Jane Sharp", "Elizabeth Blackwell", "Marie Zakrzewska", "Justina Ford", "Mabel Staupers"
    ];
    const motherNames = [
      "Jane Doe", "Anna Smith", "Emily Watson", "Sarah Connor", "Lily Evans",
      "Lucy Heartfilia", "Diana Prince", "Lois Lane", "Mary Jane", "Clara Oswald"
    ];

    for (let i = 0; i < 10; i++) {
      users.push({
        fullName: doctorNames[i],
        email: `doctor${i + 1}@safemother.com`,
        contactNumber: `07722222${String(i).padStart(2, '0')}`,
        address: `Hospital Clinic ${i + 1}`,
        dateOfBirth: `198${i}-01-15`,
        password: "Password123!",
        role: "DOCTOR",
        isActive: true,
      });
      users.push({
        fullName: midwifeNames[i],
        email: `midwife${i + 1}@safemother.com`,
        contactNumber: `07733333${String(i).padStart(2, '0')}`,
        address: `Health Center Dept ${i + 1}`,
        dateOfBirth: `198${i}-06-20`,
        password: "Password123!",
        role: "MIDWIFE",
        isActive: true,
      });
      users.push({
        fullName: motherNames[i],
        email: `mother${i + 1}@safemother.com`,
        contactNumber: `07744444${String(i).padStart(2, '0')}`,
        address: `Residential Street ${i + 1}`,
        dateOfBirth: `199${i}-11-10`,
        password: "Password123!",
        role: "MOTHER",
        isActive: true,
      });
    }

    const results = [];
    for (const u of users) {
      const existing = await userRepository.findByEmail(u.email);
      if (existing) {
        await userRepository.update(existing._id, { isActive: true, isDeleted: false });
        await userRepository.updatePassword(existing._id, u.password);
        results.push({ email: u.email, status: "updated & restored" });
      } else {
        await userRepository.create(u);
        results.push({ email: u.email, status: "created" });
      }
    }
    res.json({ success: true, message: "Sample users seeded successfully", data: results });
  } catch (err) {
    next(err);
  }
});


router.post("/login", authController.login);


router.get("/me", authenticate, authController.me);


router.post("/logout", authController.logout);


router.post("/forgot-password", authController.forgotPassword);


router.post("/reset-password", authController.resetPassword);

export default router;
