const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const config = require('../config/config');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file path
const accessLogPath = path.join(logsDir, 'access.log');

// Check log file size and reset if it exceeds 1MB (1048576 bytes)
const checkAndRotateLogFile = () => {
  try {
    if (fs.existsSync(accessLogPath)) {
      const stats = fs.statSync(accessLogPath);
      if (stats.size >= 1048576) { // 1 MB = 1048576 bytes
        fs.writeFileSync(accessLogPath, ''); // Empty the file
        console.log(`[INFO] Log file size exceeded 1MB. Log file has been emptied.`);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Error checking/rotating log file:`, err);
  }
};

// Force log rotation regardless of file size - useful for maintenance
const forceRotateLogFile = () => {
  try {
    if (fs.existsSync(accessLogPath)) {
      fs.writeFileSync(accessLogPath, ''); // Empty the file
      console.log(`[INFO] Log file has been forcibly emptied.`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`[ERROR] Error forcing log rotation:`, err);
    return false;
  }
};

// Check log file size before creating the write stream
checkAndRotateLogFile();

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(accessLogPath, { flags: 'a' });

// Create HTTP request logger middleware with minimal format
const httpLogger = morgan('[:date[iso]] :method :url :status :response-time ms', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400, // Skip logging errors (they're handled by errorHandler)
});

// Middleware to check log file size on each request
const logSizeCheckMiddleware = (req, res, next) => {
  // We don't want to check on every single request as it would impact performance
  // Instead, check randomly on about 1% of requests
  if (Math.random() < 0.01) {
    checkAndRotateLogFile();
  }
  next();
};

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

// Expose the functions
module.exports = {
  httpLogger,
  logger,
  checkAndRotateLogFile,
  logSizeCheckMiddleware,
  forceRotateLogFile
};
