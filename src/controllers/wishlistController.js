const User = require("../models/user");
const Product = require("../models/product");

// ➕ Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate productId
    if (!productId) {
      return res.status(400).json({ 
        ok: false, 
        message: "Product ID is required" 
      });
    }

    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ 
        ok: false, 
        message: "Product not found" 
      });
    }

    const user = await User.findById(req.user.userId);

    // Check if already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ 
        ok: false, 
        message: "Product already in wishlist" 
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ 
      ok: true, 
      message: "Product added to wishlist",
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
};

// ❌ Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        ok: false, 
        message: "Product ID is required" 
      });
    }

    const user = await User.findById(req.user.userId);

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(404).json({ 
        ok: false, 
        message: "Product not in wishlist" 
      });
    }

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== productId
    );
    await user.save();

    res.status(200).json({ 
      ok: true, 
      message: "Product removed from wishlist",
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
};

// 📋 Get all wishlist products
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "wishlist",
      select: "title price brand images discount mrp discountPercent" // <-- use 'title' and 'images'
    });

    if (!user) {
      return res.status(404).json({ 
        ok: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      ok: true, 
      count: user.wishlist.length,
      wishlist: user.wishlist 
    });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
};


// 🔍 Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.userId);
    const isInWishlist = user.wishlist.includes(productId);

    res.status(200).json({ 
      ok: true, 
      isInWishlist 
    });
  } catch (err) {
    console.error("Check wishlist error:", err);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
};

// 🗑️ Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.wishlist = [];
    await user.save();

    res.status(200).json({ 
      ok: true, 
      message: "Wishlist cleared" 
    });
  } catch (err) {
    console.error("Clear wishlist error:", err);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
};