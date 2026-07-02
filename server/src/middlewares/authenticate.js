import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();


export const authenticate = (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    
    const decoded = authService.verifyToken(token);

    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};
