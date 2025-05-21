const { version } = require('../../package.json');
const { ROLES } = require('../utils/constants');
const authRoutes = require('../swagger/authRoutes');
const userRoutes = require('../swagger/userRoutes');
const healthRoutes = require('../swagger/healthRoutes');
const categoryRoutes = require('../swagger/categoryRoutes');
const productRoutes = require('../swagger/productRoutes');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TNT Backend API Documentation',
    version,
    description: 'API documentation for TNT Backend',
    license: {
      name: 'ISC',
    },
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Error message',
              },
            },
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Validation failed',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      example: 'email',
                    },
                    message: {
                      type: 'string',
                      example: 'Email is required',
                    },
                  },
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          role: {
            type: 'integer',
            enum: [ROLES.ADMIN, ROLES.SALES],
            example: ROLES.SALES,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      UserWithToken: {
        allOf: [
          {
            $ref: '#/components/schemas/User',
          },
          {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        ],
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
          role: {
            type: 'integer',
            enum: [ROLES.ADMIN, ROLES.SALES],
            example: ROLES.SALES,
          },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
          role: {
            type: 'integer',
            enum: [ROLES.ADMIN, ROLES.SALES],
            example: ROLES.SALES,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'newpassword123',
          },
          role: {
            type: 'integer',
            enum: [ROLES.ADMIN, ROLES.SALES],
            example: ROLES.SALES,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          name: {
            type: 'string',
            example: 'Electronics',
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            example: 'Electronics',
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories',
          },
        },
      },
      UpdateCategoryRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Electronics',
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories',
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          name: {
            type: 'string',
            example: 'Smartphone',
          },
          description: {
            type: 'string',
            example: 'Latest model smartphone with advanced features',
          },
          imageUrls: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: [
              'products/1620000000000-smartphone1.jpg',
              'products/1620000000001-smartphone2.jpg',
            ],
            description: 'Array of S3 keys for the product images',
          },
          categoryId: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
            nullable: true,
            description: 'Category ID (optional, can be null)',
          },
          salesPrice: {
            type: 'number',
            format: 'float',
            example: 799.99,
          },
          costPrice: {
            type: 'number',
            format: 'float',
            example: 599.99,
            description: 'Only visible to admin users',
          },
          category: {
            $ref: '#/components/schemas/Category',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: {
                message: 'Not authorized to access this route',
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: {
                message: 'Not authorized to perform this action',
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: {
                message: 'User not found',
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    ...authRoutes,
    ...userRoutes,
    ...healthRoutes,
    ...categoryRoutes,
    ...productRoutes,
  },
};

const swaggerSpec = swaggerDefinition;

module.exports = swaggerSpec;
