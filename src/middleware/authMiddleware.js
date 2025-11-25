// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// module.exports = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || req.headers.Authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Not authenticated" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach user id to request (similar to verifyToken)
//     req.user = { id: decoded.userId };

//     next();
//   } catch (err) {
//     console.error("Auth Middleware Error:", err);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };


const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Not authenticated' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select('-otpHash -otpExpiresAt -__v'); // IMPORTANT → role must be included!

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;  // ✅ ensures req.user.role exists
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token invalid' });
  }
};
