const authRoutes = {
  '/api/auth/signup': {
    post: {
      summary: 'Register a new user',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SignupRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User created successfully',
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
                    allOf: [{ $ref: '#/components/schemas/UserWithToken' }],
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or email already in use',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
              examples: {
                emailInUse: {
                  value: {
                    success: false,
                    error: {
                      message: 'Email already in use',
                    },
                  },
                },
                validationError: {
                  value: {
                    success: false,
                    error: {
                      message: 'Validation failed',
                      details: [
                        {
                          field: 'email',
                          message: 'Email is required',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        403: {
          description: 'Not authorized to create admin users',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Not authorized to create admin users',
                },
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/login': {
    post: {
      summary: 'Login a user',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
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
                    allOf: [{ $ref: '#/components/schemas/UserWithToken' }],
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Email and password are required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Email and password are required',
                },
              },
            },
          },
        },
        401: {
          description: 'Invalid credentials or account disabled',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                invalidCredentials: {
                  value: {
                    success: false,
                    error: {
                      message: 'Invalid credentials',
                    },
                  },
                },
                accountDisabled: {
                  value: {
                    success: false,
                    error: {
                      message: 'Account is disabled',
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/me': {
    get: {
      summary: 'Get current user profile',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
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
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/change-password': {
    post: {
      summary: 'Change user password',
      description: 'Change the password of the authenticated user (Admin only)',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['oldPassword', 'newPassword', 'confirmPassword'],
              properties: {
                oldPassword: {
                  type: 'string',
                  description: 'Current password',
                  example: 'currentpassword123',
                },
                newPassword: {
                  type: 'string',
                  description: 'New password (min 6 characters)',
                  example: 'newpassword123',
                },
                confirmPassword: {
                  type: 'string',
                  description: 'Confirm new password (must match newPassword)',
                  example: 'newpassword123',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password changed successfully',
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
                    example: 'Password changed successfully',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or incorrect old password',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
              examples: {
                incorrectPassword: {
                  value: {
                    success: false,
                    error: {
                      message: 'Current password is incorrect',
                    },
                  },
                },
                passwordMismatch: {
                  value: {
                    success: false,
                    error: {
                      message: 'Validation failed',
                      details: [
                        {
                          field: 'confirmPassword',
                          message: 'Passwords do not match',
                        },
                      ],
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
        403: {
          $ref: '#/components/responses/ForbiddenError',
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
};

module.exports = authRoutes;
