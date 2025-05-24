const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { HTTP_STATUS, ROLES } = require('../utils/constants');

/**
 * Auth Controller Class
 * Handles authentication related operations
 */
class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/signup
   * @access Public
   */
  async signup(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        const error = new Error('Email already in use');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // If role is provided and is admin, check if the request is from an admin
      if (role === ROLES.ADMIN && (!req.user || req.user.role !== ROLES.ADMIN)) {
        const error = new Error('Not authorized to create admin users');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role: role || ROLES.SALES, // Default to SALES if not specified
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        role: user.role,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.scope('withPassword').findOne({
        where: { email },
      });

      // Check if user exists
      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Check if user is active
      if (!user.isActive) {
        const error = new Error('Account is disabled');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        role: user.role,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * @route GET /api/auth/me
   * @access Private
   */
  async getMe(req, res) {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: req.user,
    });
  }
}

module.exports = new AuthController();
