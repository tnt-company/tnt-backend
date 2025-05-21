const { body, param, query } = require('express-validator');
const { ROLES } = require('../utils/constants');

/**
 * Validation rules for user operations
 */

// Common validation for user ID
const validateUserId = [param('id').isUUID(4).withMessage('User ID must be a valid UUID')];

// Validation for getting users with pagination
const validateGetUsers = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('search').optional().isString().withMessage('Search term must be a string'),
];

// Common validation rules for user data
const userDataValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('role')
    .optional()
    .isInt()
    .withMessage('Role must be an integer')
    .isIn([ROLES.ADMIN, ROLES.SALES])
    .withMessage('Invalid role'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Validation for creating a new user
const validateCreateUser = [
  ...userDataValidation,

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation for updating a user
const validateUpdateUser = [
  ...validateUserId,
  ...userDataValidation,

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation for deleting a user
const validateDeleteUser = validateUserId;

module.exports = {
  validateGetUsers,
  validateUserId,
  validateCreateUser,
  validateUpdateUser,
  validateDeleteUser,
};
