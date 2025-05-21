const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateLogin, validateSignup } = require('../validators/authValidators');

const router = express.Router();

// Public routes with validation
router.post('/signup', validate(validateSignup), authController.signup);
router.post('/login', validate(validateLogin), authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);

module.exports = router;
