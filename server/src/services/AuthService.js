import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  
  async register(registerData) {
    const {
      fullName,
      email,
      contactNumber,
      address,
      dateOfBirth,
      password,
      role,
    } = registerData;

    
    if (!fullName || !email || !password) {
      const err = new Error("Full name, email, and password are required");
      err.statusCode = 400;
      throw err;
    }

    if (!contactNumber) {
      const err = new Error("Contact number is required");
      err.statusCode = 400;
      throw err;
    }

    if (!address) {
      const err = new Error("Address is required");
      err.statusCode = 400;
      throw err;
    }

    if (!dateOfBirth) {
      const err = new Error("Date of birth is required");
      err.statusCode = 400;
      throw err;
    }

    
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      const err = new Error("Invalid date of birth format");
      err.statusCode = 400;
      throw err;
    }
    if (dob >= new Date()) {
      const err = new Error("Date of birth must be in the past");
      err.statusCode = 400;
      throw err;
    }

    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
    if (dob > minAgeDate) {
      const err = new Error("You must be at least 18 years old to register");
      err.statusCode = 400;
      throw err;
    }

    
    const fullNameRegex = /^[a-zA-Z\s'-]+$/;
    if (!fullNameRegex.test(fullName.trim())) {
      const err = new Error("Full name must contain letters only (no numbers or special characters)");
      err.statusCode = 400;
      throw err;
    }

    
    const contactRegex = /^0\d{9}$/;
    if (!contactRegex.test(contactNumber)) {
      const err = new Error(
        "Invalid contact number format. Must be 10 digits starting with 0",
      );
      err.statusCode = 400;
      throw err;
    }

    
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      const err = new Error("User with this email already exists");
      err.statusCode = 409;
      throw err;
    }

    
    if (password.length < 6) {
      const err = new Error("Password must be at least 6 characters long");
      err.statusCode = 400;
      throw err;
    }

    const normalizedRole = (role || "MOTHER").toUpperCase();

    if (normalizedRole === "ADMIN") {
      const err = new Error(
        "Admin accounts cannot be created via registration",
      );
      err.statusCode = 403;
      throw err;
    }

    const isActive = !["DOCTOR", "MIDWIFE"].includes(normalizedRole);

    
    const user = await this.userRepository.create({
      fullName,
      email,
      contactNumber,
      address,
      dateOfBirth: dob,
      password,
      role: normalizedRole,
      isActive,
    });

    
    return this.sanitizeUser(user);
  }

  

  async login(email, password) {
    
    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.statusCode = 400;
      throw err;
    }

    
    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }
    const user = await this.userRepository.findByIdWithPassword(existingUser._id);

    if (!user) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    
    if (user.isDeleted) {
      const err = new Error("User account is Deleted");
      err.statusCode = 403;
      throw err;
    }

    
    if (!user.isActive) {
      const err = new Error("Account pending validation");
      err.statusCode = 403;
      throw err;
    }

    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const err = new Error("Invalid or expired token");
      err.statusCode = 401;
      throw err;
    }
  }

  
  generateToken(user) {
    const payload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
  }

  
  async forgotPassword(email) {
    if (!email) {
      const err = new Error("Email is required");
      err.statusCode = 400;
      throw err;
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const err = new Error("No account found with that email");
      err.statusCode = 404;
      throw err;
    }

    if (user.isDeleted) {
      const err = new Error("User account is deleted");
      err.statusCode = 403;
      throw err;
    }

    
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    
    await this.userRepository.update(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    
    await sendPasswordResetEmail(email, resetToken);

    return { message: "Password reset token sent to email" };
  }

  
  async resetPassword(email, token, newPassword) {
    if (!email || !token || !newPassword) {
      const err = new Error("Email, token, and new password are required");
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 6) {
      const err = new Error("Password must be at least 6 characters long");
      err.statusCode = 400;
      throw err;
    }

    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user) {
      const err = new Error("Invalid or expired reset token");
      err.statusCode = 400;
      throw err;
    }

    
    if (user.email !== email.toLowerCase()) {
      const err = new Error("Invalid or expired reset token");
      err.statusCode = 400;
      throw err;
    }

    
    await this.userRepository.updatePassword(user._id, newPassword);
    await this.userRepository.update(user._id, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: "Password has been reset successfully" };
  }

  
  sanitizeUser(user) {
    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }
}
