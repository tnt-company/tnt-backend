const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware
 */
const validate = validations => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));

    // Create error object with validation details
    const error = new Error('Validation failed');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.details = extractedErrors;

    return next(error);
  };
};

module.exports = validate;
