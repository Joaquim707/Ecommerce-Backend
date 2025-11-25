const express = require("express");
const router = express.Router();

const { createProduct, getAllProducts, getProductById, getFilteredProducts, addImagesToProduct, getProductsByCategorySlug, getAllColors, getProductBySlug, getProductsByLastCategory } = require("../controllers/productController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/uploadLocal");

// Create product (Admin only)
router.post("/create", verifyToken, isAdmin, createProduct);

// // Get all products
router.get("/", getAllProducts);

// Filter Products
router.get("/filter", getFilteredProducts);
router.get("/colors", getAllColors);

router.get("/slug/:slug", getProductBySlug);

router.get("/category/:slug", getProductsByCategorySlug);

router.get("/similar/:categoryName", getProductsByLastCategory);

// Get product by ID
router.get("/:id", getProductById);

router.put("/:id/add-images", verifyToken, isAdmin, upload.array("images", 5), addImagesToProduct);




// // Update product (Admin only)
// router.put("/:id", verifyToken, isAdmin, updateProduct);

// Delete product (Admin only)
// router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
