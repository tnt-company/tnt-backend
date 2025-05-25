const express = require('express');
const multer = require('multer');
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  validateGetProducts,
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateDeleteProduct,
} = require('../validators/productValidators');

const router = express.Router();

// Configure multer for memory storage (we'll upload to S3 from memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.log(`File rejected: ${file.originalname} - Invalid mimetype: ${file.mimetype}`);
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Custom error handler for multer errors like file size
const handleMulterErrors = (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log(`Multer error: ${err.message} for field ${err.field}`);
      return res.status(400).json({ success: false, message: `Image upload error: ${err.message}` });
    } else if (err) {
      console.log(`Other upload error: ${err.message}`);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// All product routes require authentication
router.use(protect);

// Routes accessible to all authenticated users (admin and sales)
router.route('/').get(validate(validateGetProducts), productController.getProducts);
router.route('/:id').get(validate(validateProductId), productController.getProductById);

// Routes that require admin access
router.route('/').post(
  adminOnly,
  handleMulterErrors, // Replace direct upload.array call
  validate(validateCreateProduct),
  productController.createProduct
);

router
  .route('/:id')
  .put(
    adminOnly,
    handleMulterErrors, // Replace direct upload.array call
    validate(validateUpdateProduct),
    productController.updateProduct
  )
  .delete(adminOnly, validate(validateDeleteProduct), productController.deleteProduct);

module.exports = router;
