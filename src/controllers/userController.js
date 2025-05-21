const userService = require('../services/userService');
const { HTTP_STATUS, PAGINATION } = require('../utils/constants');

/**
 * User Controller Class
 * Handles HTTP requests and responses for users
 */
class UserController {
  /**
   * Get all users
   * @route GET /api/users
   * @access Private/Admin
   */
  async getUsers(req, res, next) {
    try {
      const { users, total_users } = await userService.getAllUsers(
        req.query.page,
        req.query.search
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        total: Math.ceil(total_users / PAGINATION.DEFAULT_LIMIT),
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users except the currently logged-in user
   * @route GET /api/users/others
   * @access Private/Admin
   */
  async getUsersExceptCurrent(req, res, next) {
    try {
      const { users, total_users } = await userService.getAllUsersExceptCurrent(
        req.user.id,
        req.query.page,
        req.query.search
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        total: Math.ceil(total_users / PAGINATION.DEFAULT_LIMIT),
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   * @access Private/Admin
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user
   * @route POST /api/users
   * @access Private/Admin
   */
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a user
   * @route PUT /api/users/:id
   * @access Private/Admin
   */
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user
   * @route DELETE /api/users/:id
   * @access Private/Admin
   */
  async deleteUser(req, res, next) {
    try {
      const deleted = await userService.deleteUser(req.params.id);

      if (!deleted) {
        const error = new Error('User not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
