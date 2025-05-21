const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  validateGetCategories,
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
  validateDeleteCategory,
} = require('../validators/categoryValidators');

const router = express.Router();

// All category routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.route('/').get(validate(validateGetCategories), categoryController.getCategories);

router.route('/:id').get(validate(validateCategoryId), categoryController.getCategoryById);

// Routes that require admin access
router
  .route('/')
  .post(adminOnly, validate(validateCreateCategory), categoryController.createCategory);

router
  .route('/:id')
  .put(adminOnly, validate(validateUpdateCategory), categoryController.updateCategory)
  .delete(adminOnly, validate(validateDeleteCategory), categoryController.deleteCategory);

module.exports = router;
