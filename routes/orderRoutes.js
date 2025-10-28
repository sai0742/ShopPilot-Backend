const express = require('express');
const {
  getAllOrders,
  getOrderById,
  getOrderByTrackingId,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderAction,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders with filtering, sorting, and pagination
// @access  Public
router.get('/', getAllOrders);

// @route   GET /api/orders/track/:trackingId
// @desc    Get order by tracking ID
// @access  Public
router.get('/track/:trackingId', getOrderByTrackingId);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public
router.get('/:id', getOrderById);

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', createOrder);

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Public
router.put('/:id', updateOrder);

// @route   PATCH /api/orders/:id/action
// @desc    Update order action
// @access  Public
router.patch('/:id/action', updateOrderAction);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Public
router.patch('/:id/status', updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Public
router.delete('/:id', deleteOrder);

module.exports = router;
