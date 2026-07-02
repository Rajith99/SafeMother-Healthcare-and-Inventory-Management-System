import { UserRepository } from "../repositories/UserRepository.js";

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  
  async activateUser(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (user.isActive) {
      const err = new Error("User is already active");
      err.statusCode = 400;
      throw err;
    }

    const updatedUser = await this.userRepository.update(userId, {
      isActive: true,
    });

    return this.sanitizeUser(updatedUser);
  }

  
  async deactivateUser(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "ADMIN") {
      const err = new Error("Admin accounts cannot be deactivated");
      err.statusCode = 403;
      throw err;
    }

    if (!["DOCTOR", "MIDWIFE"].includes(user.role)) {
      const err = new Error(
        "Only doctor and midwife accounts can be deactivated",
      );
      err.statusCode = 403;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error("User is already inactive");
      err.statusCode = 400;
      throw err;
    }

    const updatedUser = await this.userRepository.update(userId, {
      isActive: false,
    });

    return this.sanitizeUser(updatedUser);
  }

  
  async getPendingValidation({ page, limit, search, role } = {}) {
    const filters = { isActive: false, isDeleted: false };
    if (role) filters.role = role;

    const {
      users,
      total,
      page: pg,
      limit: lim,
    } = await this.userRepository.findAll(filters, { page, limit, search });

    return {
      data: users.map((user) => this.sanitizeUser(user)),
      pagination: {
        total,
        page: pg,
        limit: lim,
        totalPages: Math.ceil(total / lim),
      },
    };
  }

  
  async getAllUsers(filters = {}, { page, limit, search } = {}) {
    const {
      users,
      total,
      page: pg,
      limit: lim,
    } = await this.userRepository.findAll(filters, { page, limit, search });

    return {
      data: users.map((user) => this.sanitizeUser(user)),
      pagination: {
        total,
        page: pg,
        limit: lim,
        totalPages: Math.ceil(total / lim),
      },
    };
  }

  async searchActiveDoctors(query = "", limit = 10) {
    const users = await this.userRepository.searchActiveByRole(
      "DOCTOR",
      query,
      limit,
    );
    return users.map((user) => this.sanitizeUser(user));
  }

  async searchActiveMidwives(query = "", limit = 10) {
    const users = await this.userRepository.searchActiveByRole(
      "MIDWIFE",
      query,
      limit,
    );
    return users.map((user) => this.sanitizeUser(user));
  }

  
  async getUserById(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    return this.sanitizeUser(user);
  }

  
  async updateUserDetails(userId, updateData) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    
    const allowedFields = ["fullName", "contactNumber", "address"];
    const sanitizedUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field];
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      const err = new Error(
        "No valid fields to update. Allowed fields: fullName, contactNumber, address",
      );
      err.statusCode = 400;
      throw err;
    }

    
    if (sanitizedUpdate.contactNumber) {
      const contactRegex = /^0\d{9}$/;
      if (!contactRegex.test(sanitizedUpdate.contactNumber)) {
        const err = new Error(
          "Invalid contact number format. Must be 10 digits starting with 0",
        );
        err.statusCode = 400;
        throw err;
      }
    }

    
    if (sanitizedUpdate.fullName !== undefined) {
      if (sanitizedUpdate.fullName.trim().length === 0) {
        const err = new Error("Full name cannot be empty");
        err.statusCode = 400;
        throw err;
      }
      const fullNameRegex = /^[a-zA-Z\s''\-]+$/;
      if (!fullNameRegex.test(sanitizedUpdate.fullName.trim())) {
        const err = new Error(
          "Full name must contain letters only (no numbers or special characters)",
        );
        err.statusCode = 400;
        throw err;
      }
    }

    
    if (
      sanitizedUpdate.address !== undefined &&
      sanitizedUpdate.address.trim().length === 0
    ) {
      const err = new Error("Address cannot be empty");
      err.statusCode = 400;
      throw err;
    }

    const updatedUser = await this.userRepository.update(
      userId,
      sanitizedUpdate,
    );

    return this.sanitizeUser(updatedUser);
  }

  
  async changePassword(userId, currentPassword, newPassword) {
    
    if (!currentPassword || !newPassword) {
      const err = new Error("Current password and new password are required");
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 6) {
      const err = new Error("New password must be at least 6 characters long");
      err.statusCode = 400;
      throw err;
    }

    if (currentPassword === newPassword) {
      const err = new Error(
        "New password must be different from the current password",
      );
      err.statusCode = 400;
      throw err;
    }

    
    const user = await this.userRepository.findByIdWithPassword(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error("Current password is incorrect");
      err.statusCode = 401;
      throw err;
    }

    
    await this.userRepository.updatePassword(userId, newPassword);
  }

  
  async deleteUser(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const deletedUser = await this.userRepository.delete(userId);

    return this.sanitizeUser(deletedUser);
  }

  
  async adminDeleteUser(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "ADMIN") {
      const err = new Error(
        "Admin accounts cannot be deleted by another admin",
      );
      err.statusCode = 403;
      throw err;
    }

    const deletedUser = await this.userRepository.delete(userId);

    return this.sanitizeUser(deletedUser);
  }

  
  sanitizeUser(user) {
    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }
}
