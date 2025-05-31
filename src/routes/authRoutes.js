const express = require('express');
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  validateLogin,
  validateSignup,
  validateChangePassword,
} = require('../validators/authValidators');

const router = express.Router();

// Public routes with validation
router.post('/signup', validate(validateSignup), authController.signup);
router.post('/login', validate(validateLogin), authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);

// Admin-only routes
router.post(
  '/change-password',
  protect,
  adminOnly,
  validate(validateChangePassword),
  authController.changePassword
);

module.exports = router;
