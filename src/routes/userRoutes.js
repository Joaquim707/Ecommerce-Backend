const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getUserProfile, 
  updateUserProfile,
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/userController');

// Existing routes
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

// Address routes
router.post("/address/add", authMiddleware, addAddress);
router.get("/address", authMiddleware, getAddresses);
router.get("/address/:addressId", authMiddleware, getAddressById);
router.put("/address/:addressId", authMiddleware, updateAddress);
router.delete("/address/:addressId", authMiddleware, deleteAddress);
router.put("/address/:addressId/set-default", authMiddleware, setDefaultAddress);

module.exports = router;