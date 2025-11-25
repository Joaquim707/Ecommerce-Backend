const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

router.get('/profile', authMiddleware, getUserProfile);
router.put("/update", authMiddleware, updateUserProfile);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Only send necessary fields
    const { name, phone } = req.user;
    res.json({ name, phone });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;