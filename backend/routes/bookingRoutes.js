const express = require("express");
const router = express.Router();
const {
  createBooking,
  confirmBooking
} = require("../controllers/bookingController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, createBooking);
router.post("/:bookingId/confirm", authenticate, confirmBooking);
// GET /api/bookings - list bookings for authenticated user
router.get('/', authenticate, require('../controllers/bookingController').getBookingsForUser);
// GET /api/bookings/:bookingId
router.get('/:bookingId', authenticate, require('../controllers/bookingController').getBooking);


module.exports = router;
