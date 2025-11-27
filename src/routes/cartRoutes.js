// const express = require("express");
// const Cart = require("../models/cart");
// const Product = require("../models/product");
// const requireLogin = require("../middleware/auth");

// const router = express.Router();

// // 🛒 ADD TO CART
// router.post("/add", async (req, res) => {
//   try {
//     const { productId, size, color, userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing" });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     let cart = await Cart.findOne({ userId });

//     // Create a new cart if user has none
//     if (!cart) {
//       cart = new Cart({
//         userId,
//         items: [],
//       });
//     }

//     // Check if item already exists (same product, size, color)
//     const existingItem = cart.items.find(
//       (item) =>
//         item.productId.toString() === productId &&
//         item.size === size &&
//         item.color === color
//     );

//     if (existingItem) {
//       // Increase quantity if exists
//       existingItem.quantity += 1;
//     } else {
//       // Add new item if it doesn't exist
//       cart.items.push({
//         productId,
//         size,
//         color,
//         quantity: 1,
//       });
//     }

//     await cart.save();

//     return res.json({
//       ok: true,
//       message: "Added to cart",
//       cart: { items: cart.items },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// });


// // 🧺 GET USER CART
// router.get("/", requireLogin, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const cart = await Cart.findOne({ userId });
//     res.json(cart || { items: [] });
//   } catch (error) {
//     res.status(500).json({
//     ok: false,
//     message: error.message,
//     stack: error.stack,
//   });
//   }
// });

// // 🔄 UPDATE QUANTITY
// router.put("/update", requireLogin, async (req, res) => {
//   try {
//     const { productId, size, qty } = req.body;
//     const userId = req.user.id;

//     const cart = await Cart.findOne({ userId });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const item = cart.items.find(
//       (i) => i.productId.toString() === productId && i.size === size
//     );

//     if (!item)
//       return res.status(404).json({ message: "Item not found in cart" });

//     item.quantity = qty;
//     await cart.save();
//     res.json(cart);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // ❌ REMOVE ITEM
// router.delete("/remove", requireLogin, async (req, res) => {
//   try {
//     const { productId, size } = req.body;
//     const userId = req.user.id;

//     const cart = await Cart.findOne({ userId });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     cart.items = cart.items.filter(
//       (i) => !(i.productId.toString() === productId && i.size === size)
//     );

//     await cart.save();
//     res.json(cart);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// module.exports = router;


const express = require("express");
const Cart = require("../models/cart");
const Product = require("../models/product");
const requireLogin = require("../middleware/auth");

const router = express.Router();

// 🛒 ADD TO CART
router.post("/add", requireLogin, async (req, res) => {
  try {
    const { productId, size, color } = req.body;
    const userId = req.user.userId; // ← Get from JWT token

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    // Create a new cart if user has none
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // Check if item already exists (same product, size, color)
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      // Increase quantity if exists
      existingItem.quantity += 1;
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        productId,
        size,
        color,
        quantity: 1,
      });
    }

    await cart.save();

    return res.json({
      ok: true,
      message: "Added to cart",
      cart: { items: cart.items },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🧺 GET USER CART
router.get("/", requireLogin, async (req, res) => {
  try {
    const userId = req.user.userId; // ← Changed from req.user._id
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
      stack: error.stack,
    });
  }
});

// 🔄 UPDATE QUANTITY
router.put("/update", requireLogin, async (req, res) => {
  try {
    const { productId, size, qty } = req.body;
    const userId = req.user.userId; // ← Changed from req.user.id

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.productId.toString() === productId && i.size === size
    );

    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = qty;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ❌ REMOVE ITEM
router.delete("/remove", requireLogin, async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.user.userId; // ← Changed from req.user.id

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => !(i.productId.toString() === productId && i.size === size)
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;