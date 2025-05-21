const { Product, Category } = require('../models');
const { PAGINATION, ROLES } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Product Service Class
 * Handles all business logic related to products
 */
class ProductService {
  /**
   * Get all products with pagination
   * @param {number} page - Page number for pagination
   * @param {number} role - User role (admin or sales)
   * @param {string} search - Search term for filtering by name
   * @param {string} categoryId - Category ID for filtering by category
   * @returns {Promise<Object>} Products and total count
   */
  async getAllProducts(page, role, search = '', categoryId = null) {
    const pageOffset = page ? (page - 1) * PAGINATION.DEFAULT_LIMIT : 0;

    // Build where clause based on search term and category
    const whereClause = {};

    // Add name search if provided
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Add category filter if provided
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const totalProducts = await Product.count({ where: whereClause });

    // Define attributes to select based on role
    const attributes =
      role === ROLES.ADMIN
        ? undefined // Admin can see all fields
        : { exclude: ['costPrice'] }; // Sales can see all except costPrice

    return {
      products: await Product.findAll({
        attributes,
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          },
        ],
        limit: PAGINATION.DEFAULT_LIMIT,
        offset: pageOffset,
        order: [['name', 'ASC']],
      }),
      totalProducts,
    };
  }

  /**
   * Get product by ID
   * @param {string} id - Product UUID
   * @param {number} role - User role (admin or sales)
   * @returns {Promise<Product|null>} Product object or null
   */
  async getProductById(id, role) {
    // Define attributes to select based on role
    const attributes =
      role === ROLES.ADMIN
        ? undefined // Admin can see all fields
        : { exclude: ['costPrice'] }; // Sales can see all except costPrice

    return await Product.findByPk(id, {
      attributes,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Product>} Created product
   */
  async createProduct(productData) {
    return await Product.create(productData);
  }

  /**
   * Update a product
   * @param {string} id - Product UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Product|null>} Updated product or null
   */
  async updateProduct(id, updateData) {
    const product = await Product.findByPk(id);

    if (!product) {
      return null;
    }

    return await product.update(updateData);
  }

  /**
   * Delete a product
   * @param {string} id - Product UUID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteProduct(id) {
    const product = await Product.findByPk(id);

    if (!product) {
      return false;
    }

    await product.destroy();
    return true;
  }
}

module.exports = new ProductService();
