module.exports = {
  '/api/products': {
    get: {
      tags: ['Products'],
      summary: 'Get all products',
      description:
        'Retrieve a list of all products with pagination, filtering, and search capabilities',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
          },
          description: 'Page number for pagination',
        },
        {
          in: 'query',
          name: 'search',
          schema: {
            type: 'string',
          },
          required: false,
          description: 'Search term to filter products by name',
        },
        {
          in: 'query',
          name: 'categoryId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
          required: false,
          description: 'Category ID to filter products by category',
        },
      ],
      responses: {
        200: {
          description: 'A list of products',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  total: {
                    type: 'integer',
                    example: 10,
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
      },
    },
    post: {
      tags: ['Products'],
      summary: 'Create a new product',
      description: 'Create a new product with optional image upload (Admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Smartphone',
                },
                description: {
                  type: 'string',
                  example: 'Latest model smartphone with advanced features',
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary',
                  },
                  description: 'Product image files (up to 10, optional)',
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid',
                  example: '550e8400-e29b-41d4-a716-446655440000',
                  description: 'Category ID (required)',
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
                },
              },
              required: ['name', 'salesPrice', 'costPrice', 'categoryId'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Product created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/ValidationError',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        403: {
          $ref: '#/components/responses/ForbiddenError',
        },
      },
    },
  },
  '/api/products/bulk': {
    post: {
      tags: ['Products'],
      summary: 'Bulk create products',
      description: 'Create multiple dummy products at once (Admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                count: {
                  type: 'integer',
                  example: 10,
                  minimum: 1,
                  maximum: 1000,
                  description: 'Number of products to create (between 1 and 1000)',
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid',
                  example: '550e8400-e29b-41d4-a716-446655440000',
                  description: 'Category ID to assign to all created products',
                },
              },
              required: ['count', 'categoryId'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Products created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Successfully created 10 products',
                  },
                  count: {
                    type: 'integer',
                    example: 10,
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/ValidationError',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        403: {
          $ref: '#/components/responses/ForbiddenError',
        },
        404: {
          description: 'Category not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Category not found',
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Get a product by ID',
      description: 'Retrieve a single product by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Product ID',
        },
      ],
      responses: {
        200: {
          description: 'Product details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
    put: {
      tags: ['Products'],
      summary: 'Update a product',
      description: 'Update an existing product by ID with optional image upload (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Product ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Smartphone',
                },
                description: {
                  type: 'string',
                  example: 'Latest model smartphone with advanced features',
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary',
                  },
                  description:
                    'Product image files (up to 10, optional). All existing images will be replaced.',
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid',
                  example: '550e8400-e29b-41d4-a716-446655440000',
                  description: 'Category ID (required)',
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
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/ValidationError',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        403: {
          $ref: '#/components/responses/ForbiddenError',
        },
        404: {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
    delete: {
      tags: ['Products'],
      summary: 'Delete a product',
      description: 'Delete a product by ID (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Product ID',
        },
      ],
      responses: {
        200: {
          description: 'Product deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Product deleted successfully',
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        403: {
          $ref: '#/components/responses/ForbiddenError',
        },
        404: {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
  },
};
