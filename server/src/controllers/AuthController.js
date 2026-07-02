import { AuthService } from "../services/AuthService.js";

function cookieConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }
  
  register = async (req, res, next) => {
    try {
      const {
        fullName,
        email,
        contactNumber,
        address,
        dateOfBirth,
        password,
        role,
      } = req.body;

      const user = await this.authService.register({
        fullName,
        email,
        contactNumber,
        address,
        dateOfBirth,
        password,
        role,
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { user, token } = await this.authService.login(email, password);

      res.cookie("token", token, cookieConfig());

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  
  me = (req, res) => {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  };

  
  logout = (req, res) => {
    res.clearCookie("token", cookieConfig());
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  };

  
  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      const result = await this.authService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  
  resetPassword = async (req, res, next) => {
    try {
      const { email, token, newPassword } = req.body;

      const result = await this.authService.resetPassword(
        email,
        token,
        newPassword,
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
