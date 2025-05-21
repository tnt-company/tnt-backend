const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const { ROLES, HTTP_STATUS } = require('../utils/constants');

/**
 * Protect routes - Authentication middleware
 * Verifies the JWT token and attaches the user to the request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Not authorized to access this route',
        },
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Invalid token',
        },
      });
    }

    // Check if user exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'User not found',
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'User account is disabled',
        },
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware
 * Restricts access to specific roles
 * @param {...number} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          message: 'Not authorized to access this route',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: 'Not authorized to perform this action',
        },
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 * Restricts access to admin users only
 */
const adminOnly = authorize(ROLES.ADMIN);

module.exports = {
  protect,
  authorize,
  adminOnly,
};
