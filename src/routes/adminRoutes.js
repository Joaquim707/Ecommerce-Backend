const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { makeAdmin } = require("../controllers/adminController");

// Only allow existing admin to promote others
router.post("/make-admin", auth, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied - Admin Only" });
  }
  next();
}, makeAdmin);

module.exports = router;
