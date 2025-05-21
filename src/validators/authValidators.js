const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

/**
 * Validation rules for authentication operations
 */

// Validation for login
const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

// Validation for signup
const validateSignup = [
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

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isInt()
    .withMessage('Role must be an integer')
    .isIn([ROLES.ADMIN, ROLES.SALES])
    .withMessage('Invalid role'),
];

module.exports = {
  validateLogin,
  validateSignup,
};
