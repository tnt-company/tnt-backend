const { Product, Category } = require('../models');
const { PAGINATION, ROLES } = require('../utils/constants');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { storageProvider } = require('../utils/storage');

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

    const totalProducts = await Product.count({
      where: whereClause,
      order: [['name', 'ASC']],
    });

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

  /**
   * Bulk create products with dummy data
   * @param {number} count - Number of products to create
   * @param {string} categoryId - Category ID to use for all products
   * @returns {Promise<Object>} Created products count and status
   */
  async bulkCreateProducts(count, categoryId) {
    // Validate count
    count = parseInt(count);
    if (isNaN(count) || count <= 0 || count > 1000) {
      throw new Error('Count must be a number between 1 and 1000');
    }

    try {
      // Read the logo file once
      const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.svg');
      const fileBuffer = fs.readFileSync(logoPath);
      const contentType = 'image/svg+xml';

      // Create array of product data
      const productsToCreate = [];
      const uploadPromises = [];

      // Create skeleton products first and collect upload promises
      for (let i = 1; i <= count; i++) {
        console.log('i', i);
        // Create a unique filename for each product to avoid S3 collisions
        const uniqueFileName = `logo-${Date.now()}-${i}.svg`;

        // Upload the same logo image but with a unique filename for each product
        const uploadPromise = storageProvider
          .uploadFile(fileBuffer, uniqueFileName, contentType)
          .then(imageKey => {
            // Add product with its unique image URL to the array
            productsToCreate.push({
              name: `Dummy Product ${Date.now()}-${i}`,
              description: `This is a dummy product created for testing purposes. Product number ${i}.`,
              imageUrls: [imageKey], // Use the unique S3 URL
              categoryId: categoryId,
              salesPrice: (Math.random() * 100 + 10).toFixed(2), // Random price between 10 and 110
              costPrice: (Math.random() * 50 + 5).toFixed(2), // Random cost between 5 and 55
            });
          });

        uploadPromises.push(uploadPromise);
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      console.log('before bulk create');
      // Use bulkCreate with individual option to trigger hooks and validations
      const createdProducts = await Product.bulkCreate(productsToCreate, {
        validate: true,
        individualHooks: true,
      });

      console.log('after bulk create');

      return {
        success: true,
        count: createdProducts.length,
        message: `Successfully created ${createdProducts.length} products with unique images`,
      };
    } catch (error) {
      console.log('error', error);
      // If error during bulk create, throw it for the controller to handle
      throw error;
    }
  }
}

module.exports = new ProductService();
