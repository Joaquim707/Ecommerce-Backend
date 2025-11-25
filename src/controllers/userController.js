const User = require('../models/user');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select("-otpHash -otpExpiresAt -__v"); // Hide sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ok: true,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from middleware
    const { name, email } = req.body;

    // Only allow updating allowed fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // return updated record
    ).select("-otpHash -otpExpiresAt -__v");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ok: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};