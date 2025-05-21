const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { httpLogger, logger } = require('./utils/logger');
const config = require('./config/config');
const { connectDB, sequelize } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const swaggerSpec = require('./config/swagger');

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(httpLogger); // HTTP request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Swagger documentation
if (config.env !== 'production') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'TNT Backend API Documentation',
    })
  );
  logger.info('Swagger documentation available at /api-docs');
}

// Routes
app.use(routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connection successful');

    // Sync database models (in development)
    if (config.env === 'development') {
      try {
        // Set alter: false to avoid altering tables during testing
        await sequelize.sync({ alter: false });
        console.log('Database sync completed successfully');
        logger.info('Database synced');
      } catch (syncError) {
        console.error('Error syncing database:', syncError);
        throw syncError;
      }
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
    });

    server.on('error', err => {
      console.error('Server error:', err);
      logger.error('Server error', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
  logger.error('Unhandled Rejection', err);
  // Log the error but don't crash the server
  console.error('Unhandled Rejection. Check logs for details.');
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  logger.error('Uncaught Exception', err);
  // Give the server a grace period to finish existing requests
  console.error('Uncaught Exception. Shutting down...');
  process.exit(1);
});

startServer();
