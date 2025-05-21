const request = require('supertest');
const express = require('express');
const authRoutes = require('../../../routes/authRoutes');
const User = require('../../../models/User');
const { generateToken } = require('../../../utils/jwtUtils');
const { ROLES } = require('../../../utils/constants');

// Mock User model and JWT utils
jest.mock('../../../models/User');
jest.mock('../../../utils/jwtUtils');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: ROLES.SALES,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);
      generateToken.mockReturnValue('test-token');

      const res = await request(app).post('/api/auth/signup').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token', 'test-token');
      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: ROLES.SALES,
      });
      expect(generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should return error if user already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ id: 1 });

      const res = await request(app).post('/api/auth/signup').send({
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('User already exists with this email');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: ROLES.SALES,
        isActive: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.scope = jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
      });
      generateToken.mockReturnValue('test-token');

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token', 'test-token');
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should return error with invalid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
        isActive: true,
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      User.scope = jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid credentials');
      expect(mockUser.matchPassword).toHaveBeenCalledWith('wrongpassword');
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return error if user does not exist', async () => {
      User.scope = jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should return error if user account is disabled', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
        isActive: false,
      };

      User.scope = jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Your account has been disabled');
    });
  });
});
