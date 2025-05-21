const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const config = require('../config/config');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

// Create HTTP request logger middleware with minimal format
const httpLogger = morgan('[:date[iso]] :method :url :status :response-time ms', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400, // Skip logging errors (they're handled by errorHandler)
});

// Simple logger for application logs
const logger = {
  info: message => {
    console.log(`[INFO] ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`);
    // Only log error details in development and if stack traces are enabled
    if (process.env.NODE_ENV === 'development' && config.showStackTrace && error) {
      console.error(error);
    }
  },
  warn: message => {
    console.warn(`[WARN] ${message}`);
  },
  debug: message => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${message}`);
    }
  },
};

module.exports = {
  httpLogger,
  logger,
};
