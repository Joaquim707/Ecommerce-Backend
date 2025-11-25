const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: String,
        brand: String,
        price: Number,
        discountedPrice: Number,
        discountPercent: Number,
        size: String,
        quantity: {
          type: Number,
          default: 1,
        },
        image: String,
        returnPeriod: {
          type: String,
          default: "7Days Return Policy",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
