const express = require('express');
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  validateGetUsers,
  validateUserId,
  validateCreateUser,
  validateUpdateUser,
  validateDeleteUser,
} = require('../validators/userValidators');

const router = express.Router();

// All user routes require authentication and admin authorization
router.use(protect, adminOnly);

// Routes with validation
router
  .route('/')
  .get(validate(validateGetUsers), userController.getUsers)
  .post(validate(validateCreateUser), userController.createUser);

// Route to get all users except the current user
router.route('/others').get(validate(validateGetUsers), userController.getUsersExceptCurrent);

router
  .route('/:id')
  .get(validate(validateUserId), userController.getUserById)
  .put(validate(validateUpdateUser), userController.updateUser)
  .delete(validate(validateDeleteUser), userController.deleteUser);

module.exports = router;
