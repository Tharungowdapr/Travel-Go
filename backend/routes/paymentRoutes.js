const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { sendOtp, verifyOtp, makePayment, getOtpStore, legacyPay } = require('../controllers/paymentController');

// Log when payment routes are loaded (helpful to verify that server has picked up changes)
console.log('🔧 paymentRoutes loaded');

// Dev ping to verify route is reachable
router.get('/ping', (req, res) => res.json({ success: true, message: 'payments ok' }));

router.post('/send-otp', authenticate, sendOtp);
router.post('/verify-otp', authenticate, verifyOtp);
router.post('/pay', authenticate, makePayment);

// Dev-only route to inspect OTP_STORE. Enabled when NODE_ENV !== 'production' or ALLOW_DEV_ENDPOINTS='true'
if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_ENDPOINTS === 'true') {
  router.get('/debug/otp-store', authenticate, getOtpStore);
}

// Legacy payment endpoint (card form) - server-side insert using service role key
router.post('/legacy-pay', authenticate, legacyPay);

module.exports = router;
