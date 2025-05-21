const User = require('../models/User');
const { PAGINATION } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * User Service Class
 * Handles all business logic related to users
 */
class UserService {
  /**
   * Get all users
   * @param {number} page - Page number for pagination
   * @param {string} search - Search term for filtering by name
   * @returns {Promise<{users: User[], total_users: number}>} Users and total count
   */
  async getAllUsers(page, search = '') {
    const page_offset = page ? (page - 1) * PAGINATION.DEFAULT_LIMIT : 0;

    // Build where clause based on search term
    const whereClause = search
      ? {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        }
      : {};

    const total_users = await User.count({ where: whereClause });

    return {
      users: await User.findAll({
        where: whereClause,
        limit: PAGINATION.DEFAULT_LIMIT,
        offset: page_offset,
        order: [['name', 'ASC']],
      }),
      total_users,
    };
  }

  /**
   * Get all users except the currently logged-in user
   * @param {string} currentUserId - ID of the currently logged-in user
   * @param {number} page - Page number for pagination
   * @param {string} search - Search term for filtering by name
   * @returns {Promise<{users: User[], total_users: number}>} Users and total count
   */
  async getAllUsersExceptCurrent(currentUserId, page, search = '') {
    const page_offset = page ? (page - 1) * PAGINATION.DEFAULT_LIMIT : 0;

    // Build where clause based on search term and excluding current user
    const whereClause = {
      id: {
        [Op.ne]: currentUserId,
      },
    };

    // Add name search condition if provided
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const total_users = await User.count({
      where: whereClause,
    });

    return {
      users: await User.findAll({
        where: whereClause,
        limit: PAGINATION.DEFAULT_LIMIT,
        offset: page_offset,
        order: [['name', 'ASC']],
      }),
      total_users,
    };
  }

  /**
   * Get user by ID
   * @param {number|string} id - User ID
   * @returns {Promise<User|null>} User object or null
   */
  async getUserById(id) {
    return await User.findByPk(id);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Update a user
   * @param {number|string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<User|null>} Updated user or null
   */
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);

    if (!user) {
      return null;
    }

    return await user.update(updateData);
  }

  /**
   * Delete a user
   * @param {number|string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      return false;
    }

    await user.destroy();
    return true;
  }
}

module.exports = new UserService();
