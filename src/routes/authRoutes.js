const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, authSetName } = require('../controllers/authcontroller.js');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post("/set-name", authSetName);

module.exports = router;
