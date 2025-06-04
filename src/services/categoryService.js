const { Category } = require('../models');
const { PAGINATION } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Category Service Class
 * Handles all business logic related to categories
 */
class CategoryService {
  /**
   * Get all categories with pagination
   * @param {number} page - Page number for pagination
   * @param {string} search - Search term for filtering by name
   * @returns {Promise<Object>} Categories and total count
   */
  async getAllCategories(page, search = '', pagination = 'true') {
    const pageOffset = page ? (page - 1) * PAGINATION.DEFAULT_LIMIT : 0;

    // Build where clause based on search term
    const whereClause = search
      ? {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        }
      : {};

    const totalCategories = await Category.count({ where: whereClause });

    if (pagination && pagination === 'true') {
      return {
        categories: await Category.findAll({
          where: whereClause,
          limit: PAGINATION.DEFAULT_LIMIT,
          offset: pageOffset,
          order: [['name', 'ASC']],
        }),
        totalCategories,
      };
    }

    return {
      categories: await Category.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      }),
    };
  }

  /**
   * Get category by ID
   * @param {string} id - Category UUID
   * @returns {Promise<Category|null>} Category object or null
   */
  async getCategoryById(id) {
    return await Category.findByPk(id);
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Category>} Created category
   */
  async createCategory(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Update a category
   * @param {string} id - Category UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Category|null>} Updated category or null
   */
  async updateCategory(id, updateData) {
    const category = await Category.findByPk(id);

    if (!category) {
      return null;
    }

    return await category.update(updateData);
  }

  /**
   * Delete a category
   * @param {string} id - Category UUID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteCategory(id) {
    const category = await Category.findByPk(id);

    if (!category) {
      return false;
    }

    await category.destroy();
    return true;
  }
}

module.exports = new CategoryService();
