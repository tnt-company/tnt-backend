const config = require('../config/config');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Log error for server-side debugging only
  if (config.env === 'development') {
    console.error(`[ERROR] ${err.message}`);
    if (config.showStackTrace) {
      console.error(err.stack);
    }
  } else {
    console.error(`[ERROR] ${err.message}`);
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Server Error',
    },
  };

  // Add validation details if available
  if (err.details) {
    errorResponse.error.details = err.details;
  }

  // Send error response to client
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
