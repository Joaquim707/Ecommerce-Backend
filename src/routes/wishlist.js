const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// ➕ Add product to wishlist
router.post("/add", wishlistController.addToWishlist);

// ❌ Remove product from wishlist
router.post("/remove", wishlistController.removeFromWishlist);

// 📋 Get all wishlist products
router.get("/", wishlistController.getWishlist);

// 🔍 Check if specific product is in wishlist
router.get("/check/:productId", wishlistController.checkWishlist);

// 🗑️ Clear entire wishlist
router.delete("/clear", wishlistController.clearWishlist);

module.exports = router;
