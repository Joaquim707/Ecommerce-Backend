const express = require("express");
const router = express.Router();

const { createCategory, getAllCategories, getProductsByCategory, getProductsByCategorySlug, getSubCategories, addImageToCategory } = require("../controllers/categoryController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/uploadLocal");

// Create category (Admin only)
router.post("/", verifyToken, isAdmin, createCategory);

// Get all categories
router.get("/", getAllCategories);

router.get("/:categoryId/products", getProductsByCategory);
router.get("/sub/:mainSlug", getSubCategories);

router.get("/slug/:slug", getProductsByCategorySlug);

router.post("/:id/image", upload.single("image"), addImageToCategory);

module.exports = router;
