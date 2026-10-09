const express = require('express');
const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/seller', authorize('seller', 'admin'), getSellerOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
