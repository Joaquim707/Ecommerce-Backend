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
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

