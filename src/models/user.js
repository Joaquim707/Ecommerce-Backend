const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true
    },
    name: { type: String },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    otpHash: { type: String },
    otpExpiresAt: { type: Date },

    // ⭐ Wishlist: stores product IDs
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    // to save user address details
    addresses: [{
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    pinCode: { type: String, required: true },
    houseNumber: { type: String, required: true },
    address: { type: String, required: true },
    locality: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' },
    isDefault: { type: Boolean, default: false }
  }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

