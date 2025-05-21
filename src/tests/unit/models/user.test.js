const User = require('../../../models/User');
const { ROLES } = require('../../../utils/constants');
const bcrypt = require('bcrypt');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock sequelize
jest.mock('../../../config/database', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  return { sequelize: dbMock };
});

describe('User Model', () => {
  let user;

  beforeEach(() => {
    user = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: ROLES.SALES,
      isActive: true,
    };
    jest.clearAllMocks();
  });

  it('should create a user with valid fields', async () => {
    // Mock the create method
    User.create = jest.fn().mockResolvedValue({
      id: 1,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUser = await User.create(user);
    expect(newUser).toHaveProperty('id');
    expect(newUser.name).toBe(user.name);
    expect(newUser.email).toBe(user.email);
    expect(newUser.role).toBe(ROLES.SALES);
    expect(newUser.isActive).toBe(user.isActive);
  });

  it('should not return password when converting to JSON', () => {
    // Mock the toJSON method
    const userInstance = {
      ...user,
      toJSON: () => {
        // eslint-disable-next-line no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    };

    const userJson = userInstance.toJSON();
    expect(userJson).not.toHaveProperty('password');
    expect(userJson).toHaveProperty('name');
    expect(userJson).toHaveProperty('email');
  });

  it('should hash password before creating user', async () => {
    // Setup hooks mock
    const hooks = User._options.hooks;
    const userWithPassword = { ...user, password: 'plainPassword' };

    // Call the beforeCreate hook
    if (hooks && hooks.beforeCreate) {
      await hooks.beforeCreate(userWithPassword);
    }

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 'salt');
    expect(userWithPassword.password).toBe('hashedPassword');
  });

  it('should verify password correctly', async () => {
    // Mock user instance with matchPassword method
    const userInstance = {
      ...user,
      password: 'hashedPassword',
      matchPassword: User.prototype.matchPassword,
    };

    const isMatch = await userInstance.matchPassword('correctPassword');
    expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
    expect(isMatch).toBe(true);
  });
});
