const User = require('../models/user');

exports.makeAdmin = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const user = await User.findOneAndUpdate(
      { phone },
      { role: "admin" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      ok: true,
      message: "User promoted to admin",
      user
    });

  } catch (err) {
    console.error("Admin creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};