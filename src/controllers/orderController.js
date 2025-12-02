// controllers/orderController.js
const Order = require('../models/order');
const Cart = require('../models/cart');

// Create new order
// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       shippingAddress,
//       paymentMethod,
//       couponCode,
//       donation,
//       selectedItems // Array of item IDs from cart
//     } = req.body;

//     // Validate shipping address
//     if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobileNumber ||
//       !shippingAddress.pinCode || !shippingAddress.addressLine1 ||
//       !shippingAddress.city || !shippingAddress.state) {
//       return res.status(400).json({ message: 'Complete shipping address is required' });
//     }

//     // Validate payment method
//     if (!paymentMethod) {
//       return res.status(400).json({ message: 'Payment method is required' });
//     }

//     // Get user's cart
//     const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

//     if (!cart || !cart.items || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     // Filter selected items (if provided)
//     let orderItems = cart.items;
//     if (selectedItems && selectedItems.length > 0) {
//       orderItems = cart.items.filter(item =>
//         selectedItems.includes(`${item.productId._id}-${item.size}-${item.color}`)
//       );
//     }

//     if (orderItems.length === 0) {
//       return res.status(400).json({ message: 'No items selected for order' });
//     }

//     // Calculate pricing
//     let totalMRP = 0;
//     let totalAmount = 0;

//     const items = orderItems.map(item => {
//       const product = item.productId;
//       const itemMRP = (product.mrp || product.price) * item.quantity;
//       const itemPrice = product.price * item.quantity;
//       const itemDiscount = itemMRP - itemPrice;

//       totalMRP += itemMRP;
//       totalAmount += itemPrice;

//       return {
//         productId: product._id,
//         name: product.name,
//         brand: product.brand,
//         image: product.images?.[0],
//         size: item.size,
//         color: item.color,
//         quantity: item.quantity,
//         price: product.price,
//         mrp: product.mrp || product.price,
//         discount: itemDiscount
//       };
//     });

//     const totalDiscount = totalMRP - totalAmount;
//     let couponDiscount = 0;

//     // Apply coupon if provided (implement your coupon logic here)
//     if (couponCode) {
//       // Example: 10% discount
//       // couponDiscount = totalAmount * 0.1;
//       // totalAmount -= couponDiscount;
//     }

//     const platformFee = 0; // FREE as per your UI
//     const shippingFee = 0; // FREE
//     const donationAmount = donation || 0;

//     const finalAmount = totalAmount + platformFee + shippingFee + donationAmount;

//     // Generate mock transaction ID for reference
//     const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

//     // Create order with payment already marked as completed
//     const order = new Order({
//       userId: req.user.id,
//       shippingAddress,
//       items,
//       pricing: {
//         totalMRP,
//         totalDiscount,
//         couponDiscount,
//         platformFee,
//         shippingFee,
//         donation: donationAmount,
//         totalAmount: finalAmount
//       },
//       payment: {
//         method: paymentMethod,
//         status: 'Completed', // Mark as completed immediately
//         transactionId: transactionId,
//         paidAt: new Date() // Set payment date to now
//       },
//       orderStatus: 'Confirmed', // Start with confirmed status
//       couponCode,
//       statusHistory: [
//         {
//           status: 'Pending',
//           timestamp: new Date(),
//           note: 'Order created'
//         },
//         {
//           status: 'Confirmed',
//           timestamp: new Date(),
//           note: 'Order confirmed and payment received'
//         }
//       ]
//     });

//     await order.save();

//     // Remove ordered items from cart
//     if (selectedItems && selectedItems.length > 0) {
//       cart.items = cart.items.filter(item =>
//         !selectedItems.includes(`${item.productId._id}-${item.size}-${item.color}`)
//       );
//       await cart.save();
//     } else {
//       // Clear entire cart
//       cart.items = [];
//       await cart.save();
//     }

//     // Populate the order with product details before sending response
//     const populatedOrder = await Order.findById(order._id).populate('items.productId');

//     res.status(201).json({
//       success: true,
//       message: 'Order placed successfully',
//       order: populatedOrder,
//       orderNumber: order.orderNumber,
//       transactionId: transactionId
//     });

//   } catch (error) {
//     console.error('Create order error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to place order',
//       error: error.message
//     });
//   }
// };

exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      couponCode,
      donation,
      selectedItems // Array of itemId strings
    } = req.body;

    // -------------------------
    // VALIDATE SHIPPING ADDRESS
    //--------------------------
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.mobileNumber ||
      !shippingAddress.pinCode ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
        missingFields: {
          fullName: !shippingAddress?.fullName,
          mobileNumber: !shippingAddress?.mobileNumber,
          pinCode: !shippingAddress?.pinCode,
          addressLine1: !shippingAddress?.addressLine1,
          city: !shippingAddress?.city,
          state: !shippingAddress?.state,
        }
      });
    }

    // -------------------------
    // VALIDATE PAYMENT METHOD
    //--------------------------
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }

    // -------------------------
    // GET USER CART
    //--------------------------
    const userId = req.user.userId || req.user.id; // from your log, userId is set

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    console.log("📌 USER CART:", cart);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // -------------------------
    // FILTER SELECTED ITEMS
    //--------------------------
    let orderItems = cart.items;

    if (Array.isArray(selectedItems) && selectedItems.length > 0) {
      orderItems = cart.items.filter(item => {
        const key = `${item.productId._id}-${item.size}-${item.color}`;
        return selectedItems.includes(key);
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items selected for order"
      });
    }

    // -------------------------
    // CALCULATE PRICES
    //--------------------------
    let totalMRP = 0;
    let totalAmount = 0;

    const items = orderItems.map(item => {
      const product = item.productId;
      const itemMRP = (product.mrp || product.price) * item.quantity;
      const itemPrice = product.price * item.quantity;
      const itemDiscount = itemMRP - itemPrice;

      totalMRP += itemMRP;
      totalAmount += itemPrice;

      return {
        productId: product._id,
        // make sure this matches your Product schema (name / title)
        name: product.name || product.title, 
        brand: product.brand,
        image: product.images?.[0],
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product.price,
        mrp: product.mrp || product.price,
        discount: itemDiscount
      };
    });

    console.log("🧾 ORDER ITEMS BEFORE SAVE:", items);

    const totalDiscount = totalMRP - totalAmount;
    let couponDiscount = 0;

    // TO-DO: handle coupons
    if (couponCode) {
      // add logic here
    }

    const platformFee = 0;
    const shippingFee = 0;
    const donationAmount = donation || 0;

    const finalAmount = totalAmount + platformFee + shippingFee + donationAmount;

    // -------------------------
    // ORDER NUMBER & TRANSACTION ID
    //--------------------------
    const orderNumber = `ORD-${Date.now()}`;
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // -------------------------
    // CREATE ORDER
    //--------------------------
    const order = new Order({
      userId,               // ✅ correct user id
      orderNumber,          // ✅ required in schema
      shippingAddress,
      items,
      pricing: {
        totalMRP,
        totalDiscount,
        couponDiscount,
        platformFee,
        shippingFee,
        donation: donationAmount,
        totalAmount: finalAmount
      },
      payment: {
        method: paymentMethod,
        status: "Completed",
        transactionId,
        paidAt: new Date()
      },
      orderStatus: "Confirmed",
      couponCode,
      statusHistory: [
        {
          status: "Pending",
          timestamp: new Date(),
          note: "Order created"
        },
        {
          status: "Confirmed",
          timestamp: new Date(),
          note: "Order confirmed and payment received"
        }
      ]
    });

    await order.save();

    // -------------------------
    // REMOVE ORDERED ITEMS FROM CART
    //--------------------------
    if (selectedItems && selectedItems.length > 0) {
      cart.items = cart.items.filter(item => {
        const key = `${item.productId._id}-${item.size}-${item.color}`;
        return !selectedItems.includes(key);
      });
    } else {
      cart.items = []; // clear all
    }

    await cart.save();

    // -------------------------
    // POPULATE ORDER BEFORE RETURNING
    //--------------------------
    const populatedOrder = await Order.findById(order._id).populate("items.productId");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
      orderNumber: order.orderNumber,
      transactionId
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message
    });
  }
};



// Get all orders for user
exports.getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.userId };

    // Filter by status if provided
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order by ID
// exports.getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.orderId,
//       userId: req.user.userId
//     }).populate('items.productId');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     res.json({
//       success: true,
//       order
//     });
//   } catch (error) {
//     console.error('Get order error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch order',
//       error: error.message
//     });
//   }
// };

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.userId
    }).populate({
      path: 'items.productId',       // populate the product details for each item
      select: '-__v',                // optional: exclude __v if not needed
      // If you want to populate nested fields, you can do it here
      // e.g., populate category: { path: 'categoryId' }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};


// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier, estimatedDelivery } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    // Update tracking information if provided
    if (trackingNumber) {
      order.tracking.trackingNumber = trackingNumber;
    }
    if (carrier) {
      order.tracking.carrier = carrier;
    }
    if (estimatedDelivery) {
      order.tracking.estimatedDelivery = estimatedDelivery;
    }

    // Update individual item status
    order.items.forEach(item => {
      item.status = status;
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('items.productId');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: `Cancelled by user. Reason: ${reason}`
    });

    // Update item status
    order.items.forEach(item => {
      item.status = 'Cancelled';
    });

    // Update payment status - mark as refunded
    if (order.payment.status === 'Completed') {
      order.payment.status = 'Refunded';
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('items.productId');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Request return
exports.returnOrder = async (req, res) => {
  try {
    const { reason, items } = req.body; // items: array of item IDs to return

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Return reason is required'
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only return delivered orders'
      });
    }

    // Check if return window has passed (e.g., 7 days)
    const deliveryDate = order.statusHistory.find(h => h.status === 'Delivered')?.timestamp;
    if (deliveryDate) {
      const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceDelivery > 7) {
        return res.status(400).json({
          success: false,
          message: 'Return window has expired (7 days from delivery)'
        });
      }
    }

    // If specific items provided, return only those
    if (items && items.length > 0) {
      order.items.forEach(item => {
        if (items.includes(item._id.toString())) {
          item.status = 'Returned';
        }
      });

      // Check if all items are returned
      const allReturned = order.items.every(item => item.status === 'Returned');
      if (allReturned) {
        order.orderStatus = 'Returned';
      }
    } else {
      // Return entire order
      order.orderStatus = 'Returned';
      order.items.forEach(item => {
        item.status = 'Returned';
      });
    }

    order.returnReason = reason;
    order.statusHistory.push({
      status: 'Returned',
      timestamp: new Date(),
      note: `Return requested. Reason: ${reason}`
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('items.productId');

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process return request',
      error: error.message
    });
  }
};

// Get order statistics (for user dashboard)
exports.getOrderStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Order.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ userId });
    const totalSpent = await Order.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);

    res.json({
      success: true,
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.mobileNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};