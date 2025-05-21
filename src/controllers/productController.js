const productService = require('../services/productService');
const { storageProvider } = require('../utils/storage');
const { HTTP_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Product Controller Class
 * Handles HTTP requests and responses for products
 */
class ProductController {
  /**
   * Get all products
   * @route GET /api/products
   * @access Private
   */
  async getProducts(req, res, next) {
    try {
      const { products, totalProducts } = await productService.getAllProducts(
        req.query.page,
        req.user.role,
        req.query.search,
        req.query.categoryId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        total: Math.ceil(totalProducts / PAGINATION.DEFAULT_LIMIT),
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * @route GET /api/products/:id
   * @access Private
   */
  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id, req.user.role);

      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new product
   * @route POST /api/products
   * @access Private/Admin
   */
  async createProduct(req, res, next) {
    try {
      const productData = { ...req.body };

      // Handle image uploads if files are provided
      if (req.files && req.files.length > 0) {
        const imageUrls = [];

        // Upload each image to S3
        for (const file of req.files) {
          const fileBuffer = file.buffer;
          const fileName = file.originalname;
          const contentType = file.mimetype;

          // Upload to S3 and get the file key
          const imageKey = await storageProvider.uploadFile(fileBuffer, fileName, contentType);
          imageUrls.push(imageKey);
        }

        // Set the imageUrls in product data
        productData.imageUrls = imageUrls;
      } else {
        // Set empty array if no images
        productData.imageUrls = [];
      }

      const product = await productService.createProduct(productData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a product
   * @route PUT /api/products/:id
   * @access Private/Admin
   */
  async updateProduct(req, res, next) {
    try {
      const updateData = { ...req.body };

      // Get current product to check if we need to delete old images
      const currentProduct = await productService.getProductById(req.params.id, req.user.role);

      if (!currentProduct) {
        const error = new Error('Product not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Handle image uploads if files are provided
      if (req.files && req.files.length > 0) {
        // Delete all existing images if they exist
        if (currentProduct.imageUrls && currentProduct.imageUrls.length > 0) {
          const deletePromises = currentProduct.imageUrls.map(imageUrl =>
            storageProvider.deleteFile(imageUrl).catch(err => {
              // Log error but continue with update
              console.error(`Error deleting old image ${imageUrl}:`, err.message);
            })
          );

          await Promise.all(deletePromises);
        }

        const imageUrls = [];

        // Upload each new image to S3
        for (const file of req.files) {
          const fileBuffer = file.buffer;
          const fileName = file.originalname;
          const contentType = file.mimetype;

          // Upload to S3 and get the file key
          const imageKey = await storageProvider.uploadFile(fileBuffer, fileName, contentType);
          imageUrls.push(imageKey);
        }

        // Set the imageUrls in update data
        updateData.imageUrls = imageUrls;
      }

      const product = await productService.updateProduct(req.params.id, updateData);

      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a product
   * @route DELETE /api/products/:id
   * @access Private/Admin
   */
  async deleteProduct(req, res, next) {
    try {
      // Get product to retrieve images before deletion
      const product = await productService.getProductById(req.params.id, req.user.role);

      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Delete all product images from S3 if they exist
      if (product.imageUrls && product.imageUrls.length > 0) {
        const deletePromises = product.imageUrls.map(imageUrl =>
          storageProvider.deleteFile(imageUrl).catch(err => {
            // Log error but continue with deletion
            console.error(`Error deleting product image ${imageUrl}:`, err.message);
          })
        );

        await Promise.all(deletePromises);
      }

      // Delete product from database
      await productService.deleteProduct(req.params.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
