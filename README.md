# TNT Backend API

A Node.js Express API with PostgreSQL and Sequelize ORM.

## Features

- Express.js RESTful API
- PostgreSQL with Sequelize ORM
- Class-based architecture following SOLID principles
- JWT Authentication and Role-based Authorization
- Password hashing with bcrypt
- Simplified error handling with minimal stack traces
- Request logging
- Unit and integration testing with Jest
- ESLint and Prettier for code quality

## Project Structure

```
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── database/      # Migrations and seeders
│   ├── middleware/    # Express middleware
│   ├── models/        # Sequelize models
│   ├── routes/        # Express routes
│   ├── services/      # Business logic
│   ├── tests/         # Tests
│   │   ├── unit/      # Unit tests
│   │   └── integration/ # Integration tests
│   ├── utils/         # Utility functions
│   └── index.js       # Application entry point
├── .env.example       # Environment variables example
├── .eslintrc.json     # ESLint configuration
├── .gitignore         # Git ignore file
├── .prettierrc.json   # Prettier configuration
├── .sequelizerc       # Sequelize CLI configuration
├── jest.config.js     # Jest configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL credentials.

### Database Setup

1. Create the database:

```bash
npm run db:create
```

2. Run migrations:

```bash
npm run db:migrate
```

3. Seed the database with an admin user:

```bash
npm run db:seed:all
```

Default admin credentials:
- Email: admin@example.com
- Password: admin123

Note: SQL query logging is disabled by default. If you want to enable it, set `DB_LOGGING=true` in your `.env` file.

### Configuration

The application can be configured through environment variables in the `.env` file:

- `PORT`: The port the server will run on (default: 3000)
- `NODE_ENV`: Environment mode (development, production, test)
- `SHOW_STACK_TRACE`: Whether to show stack traces in error logs (default: false)
- `DB_LOGGING`: Whether to log SQL queries (default: false)
- `LOG_LEVEL`: Level of logging (debug, info, warn, error)

### Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Linting and Formatting

Lint code:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (Protected)

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/others` - Get all users except the currently logged-in user
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Products

- `GET /api/products` - Get all products (Admin & Sales)
- `GET /api/products/:id` - Get product by ID (Admin & Sales)
- `POST /api/products` - Create a new product (Admin only)
- `PUT /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

**Notes:** 
- Sales users can view products but cannot see the cost price field. Admin users have full access to all product data.
- Product creation and updates support multiple image uploads (up to 10) using multipart/form-data. The image files are stored in AWS S3 and the resulting S3 keys are saved in the product's imageUrls array.
- When updating a product with new images, all existing images are deleted from S3 storage first.

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected routes, include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Authorization

The API implements role-based access control with two roles:

- **Admin (1)**: Has access to all endpoints
- **Sales (2)**: Has limited access based on their role

User management endpoints are restricted to admin users only.

## Error Handling

The API provides simplified error responses without stack traces by default. Errors are logged on the server but only minimal information is sent to clients for security reasons.

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

## API Documentation

The API documentation is available through Swagger UI at `http://localhost:3000/api-docs` when running the application in development mode.

The documentation covers:
- All available endpoints
- Request parameters and query options
- Response formats
- Authentication requirements
- Examples

### Listing APIs with Search and Filtering

The following listing endpoints support search and filtering capabilities:

- **Users**: 
  - `GET /api/users` - Supports searching users by name using the `search` query parameter
  - `GET /api/users/others` - Supports searching other users by name using the `search` query parameter

- **Categories**:
  - `GET /api/categories` - Supports searching categories by name using the `search` query parameter

- **Products**:
  - `GET /api/products` - Supports searching products by name using the `search` query parameter and filtering by category using the `categoryId` query parameter

All listing endpoints continue to support pagination using the `page` parameter.

> Note: Swagger documentation is disabled in production mode for security reasons.

## Storage Utility

The application includes a storage utility for handling file uploads to cloud storage services. Currently, the implementation supports AWS S3, but the architecture allows for easy extension to other providers in the future.

### Configuration

To use the storage utility, configure the following environment variables:

```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
```

### Usage

```javascript
const { storageProvider } = require('./src/utils/storage');

// Upload a single file
const fileKey = await storageProvider.uploadFile(fileBuffer, 'filename.jpg', 'image/jpeg');

// Upload multiple files
const imageKeys = [];
for (const file of files) {
  const key = await storageProvider.uploadFile(
    file.buffer, 
    file.originalname, 
    file.mimetype
  );
  imageKeys.push(key);
}

// Get file URL
const fileUrl = storageProvider.getFileUrl(fileKey);

// Delete a file
await storageProvider.deleteFile(fileKey);

// Delete multiple files
const deletePromises = imageKeys.map(key => storageProvider.deleteFile(key));
await Promise.all(deletePromises);
```

The storage utility uses an abstraction layer that will make it easy to switch to different storage providers in the future.

## License

ISC 