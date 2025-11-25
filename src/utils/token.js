// const jwt = require('jsonwebtoken');

// const signToken = (payload) => {
//   return jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES || '7d',
//   });
// };

// const verifyToken = (token) => {
//   return jwt.verify(token, process.env.JWT_SECRET);
// };

// module.exports = { signToken, verifyToken };
const jwt = require("jsonwebtoken");

exports.signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};