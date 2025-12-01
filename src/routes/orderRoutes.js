const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth'); // You'll need to create this

// User routes
router.post('/create', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getMyOrders);
router.get('/stats', auth, orderController.getOrderStats);
router.get('/:orderId', auth, orderController.getOrderById);
router.put('/:orderId/cancel', auth, orderController.cancelOrder);
router.put('/:orderId/return', auth, orderController.returnOrder);

// Admin routes
router.get('/', auth, adminAuth, orderController.getAllOrders);
router.put('/:orderId/status', auth, adminAuth, orderController.updateOrderStatus);
router.put('/:orderId/payment', auth, adminAuth, orderController.updatePaymentStatus);

module.exports = router;