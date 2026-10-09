const express = require('express');
const {
  getProducts,
  getMyProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/mine', protect, authorize('seller', 'admin'), getMyProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('seller', 'admin'), validateProduct, createProduct);
router.patch('/:id', protect, authorize('seller', 'admin'), validateProduct, updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
