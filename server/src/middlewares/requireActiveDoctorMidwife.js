import { UserRepository } from "../repositories/UserRepository.js";

const userRepository = new UserRepository();

export const requireActiveDoctorMidwife = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!["DOCTOR", "MIDWIFE"].includes(req.user.role)) {
      return next();
    }

    const user = await userRepository.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account pending validation",
      });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User status check failed",
    });
  }
};
