const { body, param, query } = require('express-validator');

/**
 * Validation rules for category operations
 */

// Common validation for category ID
const validateCategoryId = [param('id').isUUID(4).withMessage('Category ID must be a valid UUID')];

// Validation for getting categories with pagination
const validateGetCategories = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('search').optional().isString().withMessage('Search term must be a string'),
];

// Common validation rules for category data
const categoryDataValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('description').optional().isString().withMessage('Description must be a string'),
];

// Validation for creating a new category
const validateCreateCategory = categoryDataValidation;

// Validation for updating a category
const validateUpdateCategory = [...validateCategoryId, ...categoryDataValidation];

// Validation for deleting a category
const validateDeleteCategory = validateCategoryId;

module.exports = {
  validateGetCategories,
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
  validateDeleteCategory,
};
