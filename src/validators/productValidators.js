const { body, param, query } = require('express-validator');

/**
 * Validation rules for product operations
 */

// Common validation for product ID
const validateProductId = [param('id').isUUID(4).withMessage('Product ID must be a valid UUID')];

// Validation for getting products with pagination
const validateGetProducts = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('search').optional().isString().withMessage('Search term must be a string'),
  query('categoryId')
    .optional()
    .custom(value => {
      // If value is empty string, accept it
      if (value === '') {
        return true;
      }
      // Otherwise, check if it's a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        throw new Error('Category ID must be a valid UUID');
      }
      return true;
    }),
];

// Common validation rules for product data
const productDataValidation = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('description').optional().isString().withMessage('Description must be a string'),

  body('imageUrls').optional().isArray().withMessage('Image URLs must be an array'),

  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID(4)
    .withMessage('Category ID must be a valid UUID'),

  body('salesPrice')
    .notEmpty()
    .withMessage('Sales price is required')
    .isFloat({ min: 0 })
    .withMessage('Sales price must be a positive number'),

  body('costPrice')
    .notEmpty()
    .withMessage('Cost price is required')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
];

// Validation for creating a new product
const validateCreateProduct = productDataValidation;

// Validation for updating a product
const validateUpdateProduct = [
  ...validateProductId,
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('description').optional().isString().withMessage('Description must be a string'),

  body('imageUrls').optional().isArray().withMessage('Image URLs must be an array'),

  body('categoryId')
    .optional()
    .notEmpty()
    .withMessage('Category ID cannot be empty if provided')
    .isUUID(4)
    .withMessage('Category ID must be a valid UUID'),

  body('salesPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sales price must be a positive number'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
];

// Validation for deleting a product
const validateDeleteProduct = validateProductId;

module.exports = {
  validateGetProducts,
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateDeleteProduct,
};
