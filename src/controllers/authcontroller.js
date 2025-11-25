// const crypto = require("crypto");
// const bcrypt = require("bcrypt");
// const User = require("../models/user");
// const jwt = require("jsonwebtoken");
// const { sendSMS } = require("../utils/sms");
// const { signToken } = require("../utils/token");

// const generateOTP = () => {
//   // 6 digit numeric
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// exports.requestOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone)
//       return res.status(400).json({ message: "Phone number required" });

//     const otp = generateOTP();
//     const salt = await bcrypt.genSalt(10);
//     const otpHash = await bcrypt.hash(otp, salt);
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

//     let user = await User.findOne({ phone });
//     if (!user) {
//       user = new User({ phone, otpHash, otpExpiresAt: expiresAt });
//     } else {
//       user.otpHash = otpHash;
//       user.otpExpiresAt = expiresAt;
//     }
//     await user.save();

//     const msg = `Your OTP for Myntra-clone is ${otp}. It expires in 5 minutes.`;
//     await sendSMS(phone, msg);

//     return res.json({ ok: true, message: "OTP sent (or logged)." });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp)
//       return res.status(400).json({ message: "Phone and OTP required" });

//     let user = await User.findOne({ phone });

//     // If user does not exist → create placeholder user
//     if (!user) {
//       user = await User.create({ phone });
//     }

//     if (!user.otpHash)
//       return res.status(400).json({ message: "No OTP requested" });

//     if (user.otpExpiresAt < new Date())
//       return res.status(400).json({ message: "OTP expired" });

//     const isMatch = await bcrypt.compare(otp, user.otpHash);
//     if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

//     // Clear OTP fields
//     user.otpHash = undefined;
//     user.otpExpiresAt = undefined;
//     await user.save();

//     // NEW USER → name step
//     if (!user.name || user.name.trim() === "") {
//       const tempToken = jwt.sign(
//         {
//           userId: user._id,
//           isNewUser: true,
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "10m" }
//       );

//       return res.json({
//         ok: true,
//         newUser: true,
//         tempToken,
//         message: "New user. Name required.",
//       });
//     }

//     // EXISTING USER → final login
//     const token = signToken({
//       userId: user._id,
//       phone: user.phone,
//       role: user.role,
//     });

//     return res.json({
//       ok: true,
//       newUser: false,
//       token,
//       user: {
//         id: user._id,
//         phone: user.phone,
//         name: user.name,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.authSetName = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const { name } = req.body;

//     if (!authHeader)
//       return res.status(401).json({ message: "Missing token" });

//     if (!name || name.trim().length < 3) {
//       return res.status(400).json({ message: "Invalid name" });
//     }

//     const token = authHeader.split(" ")[1];

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       console.error("JWT verify error in authSetName:", err.message);
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }

//     if (!decoded.isNewUser) {
//       return res.status(400).json({ message: "Invalid token type" });
//     }

//     const user = await User.findById(decoded.userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Save name
//     user.name = name.trim();
//     await user.save();

//     // Issue final login token
//     const finalToken = signToken({
//       userId: user._id,
//       phone: user.phone,
//       role: user.role,
//     });

//     return res.json({
//       ok: true,
//       token: finalToken,
//       user: {
//         id: user._id,
//         phone: user.phone,
//         name: user.name,
//       },
//     });
//   } catch (err) {
//     console.error("authSetName error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate final login token
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ===========================================================
   1. REQUEST OTP (DEV MODE: Always sends 123456)
=========================================================== */
exports.requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    // DEFAULT OTP for development
    const otp = "123456";

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        phone,
        otpHash: otp,
        otpExpiresAt: null,
      });
    } else {
      user.otpHash = otp;
      user.otpExpiresAt = null;
    }

    await user.save();

    return res.json({
      ok: true,
      otp: otp, // send to frontend for testing
      message: "OTP generated successfully (DEV MODE: Always 123456)",
    });
  } catch (err) {
    console.error("OTP Request Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   2. VERIFY OTP (Accepts only 123456)
=========================================================== */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number & OTP are required" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      // new user created without name
      user = await User.create({ phone });
    }

    // Validate OTP (Development mode)
    if (otp !== "123456") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP fields
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // NEW USER (no name yet)
    if (!user.name || user.name.trim() === "") {
      const tempToken = jwt.sign(
        {
          userId: user._id,
          isNewUser: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      return res.json({
        ok: true,
        newUser: true,
        tempToken,
        message: "New user. Name is required.",
      });
    }

    // EXISTING USER → LOGIN
    const token = signToken({
      userId: user._id,
      phone: user.phone,
      role: user.role,
    });

    return res.json({
      ok: true,
      newUser: false,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   3. SET NAME (Only new user flow)
=========================================================== */
exports.authSetName = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { name } = req.body;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing token" });
    }

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Invalid name" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Only allow name update if isNewUser: true
    if (!decoded.isNewUser) {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save name
    user.name = name.trim();
    await user.save();

    // Final login token
    const finalToken = signToken({
      userId: user._id,
      phone: user.phone,
      role: user.role,
    });

    return res.json({
      ok: true,
      token: finalToken,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Set Name Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
