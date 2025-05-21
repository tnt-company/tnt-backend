const request = require('supertest');
const express = require('express');
const userRoutes = require('../../../routes/userRoutes');
const User = require('../../../models/User');
const { ROLES } = require('../../../utils/constants');

// Mock dependencies
jest.mock('../../../models/User');
jest.mock('../../../utils/jwtUtils');
jest.mock('../../../middleware/auth', () => {
  const originalModule = jest.requireActual('../../../middleware/auth');
  return {
    ...originalModule,
    protect: jest.fn((req, res, next) => {
      req.user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: ROLES.ADMIN,
      };
      next();
    }),
    adminOnly: jest.fn((req, res, next) => {
      if (req.user && req.user.role === ROLES.ADMIN) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: {
            message: 'Not authorized to perform this action',
          },
        });
      }
    }),
  };
});

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users when authenticated as admin', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: ROLES.SALES,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: ROLES.ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      User.findAll = jest.fn().mockResolvedValue(mockUsers);

      const res = await request(app).get('/api/users').set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(User.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      User.findAll = jest.fn().mockRejectedValue(new Error(errorMessage));

      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID when authenticated as admin', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: ROLES.SALES,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      const res = await request(app).get('/api/users/1').set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        })
      );
      expect(User.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      User.findByPk = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .get('/api/users/999')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user when authenticated as admin', async () => {
      const mockUser = {
        id: 3,
        name: 'New User',
        email: 'new@example.com',
        role: ROLES.SALES,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      User.create = jest.fn().mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: ROLES.SALES,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        })
      );
      expect(User.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: ROLES.SALES,
      });
    });
  });
});
