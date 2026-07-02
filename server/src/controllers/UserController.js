import { UserService } from "../services/UserService.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  
  activateUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await this.userService.activateUser(userId);

      return res.status(200).json({
        success: true,
        message: "User activated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  
  deactivateUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await this.userService.deactivateUser(userId);

      return res.status(200).json({
        success: true,
        message: "User deactivated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  
  getPendingValidation = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search = "", role } = req.query;

      const result = await this.userService.getPendingValidation({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
      });

      return res.status(200).json({
        success: true,
        message: "Pending validation users retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  
  getAllUsers = async (req, res, next) => {
    try {
      const { role, isActive, page = 1, limit = 10, search = "" } = req.query;
      const filters = {};

      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === "true";

      const result = await this.userService.getAllUsers(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  
  searchDoctors = async (req, res, next) => {
    try {
      const { query = "", limit = 10 } = req.query;
      const data = await this.userService.searchActiveDoctors(
        String(query),
        parseInt(limit),
      );

      return res.status(200).json({
        success: true,
        message: "Doctors retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  
  searchMidwives = async (req, res, next) => {
    try {
      const { query = "", limit = 10 } = req.query;
      const data = await this.userService.searchActiveMidwives(
        String(query),
        parseInt(limit),
      );

      return res.status(200).json({
        success: true,
        message: "Midwives retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  
  getUserById = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await this.userService.getUserById(userId);

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  
  updateUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { fullName, contactNumber, address } = req.body;

      const user = await this.userService.updateUserDetails(userId, {
        fullName,
        contactNumber,
        address,
      });

      return res.status(200).json({
        success: true,
        message: "User details updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  
  changePassword = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;

      await this.userService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  
  deleteUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await this.userService.deleteUser(userId);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  
  adminDeleteUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await this.userService.adminDeleteUser(userId);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
