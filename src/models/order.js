// models/Order.js

const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  // Shipping Address
  shippingAddress: {
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    pinCode: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' }
  },
  // Order Items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    size: { type: String, required: true },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Price at time of order
    mrp: { type: Number }, // MRP at time of order
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending'
    }
  }],
  // Pricing Details
  pricing: {
    totalMRP: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    donation: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  // Payment Details
  payment: {
    method: {
      type: String,
      enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  // Order Status
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  // Tracking
  tracking: {
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date }
  },
  // Timestamps for different stages
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  // Additional Info
  couponCode: { type: String },
  notes: { type: String },
  cancellationReason: { type: String },
  returnReason: { type: String }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);