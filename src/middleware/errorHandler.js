const config = require('../config/config');
const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
} = require('sequelize');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;

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

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    errorResponse.error.message = 'Validation failed';
    errorResponse.error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle unique constraint errors
  else if (err instanceof UniqueConstraintError) {
    statusCode = 400;
    errorResponse.error.message = 'Database constraint failed';
    errorResponse.error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message || `${e.path} must be unique`,
    }));
  }
  // Handle foreign key constraint errors
  else if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    const field = err.fields && err.fields[0];
    errorResponse.error.message = 'Invalid reference';
    errorResponse.error.details = [
      {
        field: field || 'unknown',
        message: `Referenced ${field || 'entity'} does not exist or cannot be modified`,
      },
    ];
  }
  // Handle other database errors
  else if (err instanceof DatabaseError) {
    statusCode = 400;
    // Extract useful information if possible
    const match =
      err.message.match(/relation "([^"]+)" violates foreign key constraint "([^"]+)"/) ||
      err.message.match(/Key \(([^)]+)\)=\(([^)]+)\) is not present in table "([^"]+)"/);

    if (match) {
      errorResponse.error.message = 'Database constraint violated';
      errorResponse.error.details = [
        {
          field: match[1] || 'unknown',
          message: `Referenced item does not exist`,
        },
      ];
    }
  }
  // Add validation details if available from other validation errors
  else if (err.details) {
    errorResponse.error.details = err.details;
  }

  // Send error response to client
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
