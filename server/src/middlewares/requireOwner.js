
export const requireOwner = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const resourceUserId = req.params.userId;
    const requestingUserId = req.user.userId;

    if (requestingUserId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own data",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};
