const categoryService = require('../services/categoryService');
const { HTTP_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Category Controller Class
 * Handles HTTP requests and responses for categories
 */
class CategoryController {
  /**
   * Get all categories
   * @route GET /api/categories
   * @access Private
   */
  async getCategories(req, res, next) {
    try {
      const { categories, totalCategories } = await categoryService.getAllCategories(
        req.query.page,
        req.query.search
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        total: Math.ceil(totalCategories / PAGINATION.DEFAULT_LIMIT),
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   * @route GET /api/categories/:id
   * @access Private
   */
  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);

      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new category
   * @route POST /api/categories
   * @access Private/Admin
   */
  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a category
   * @route PUT /api/categories/:id
   * @access Private/Admin
   */
  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);

      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a category
   * @route DELETE /api/categories/:id
   * @access Private/Admin
   */
  async deleteCategory(req, res, next) {
    try {
      const deleted = await categoryService.deleteCategory(req.params.id);

      if (!deleted) {
        const error = new Error('Category not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
