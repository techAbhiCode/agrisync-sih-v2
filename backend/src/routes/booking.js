const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

// TEMP DEBUG - no auth
router.get('/all', bookingController.getAllBookings);

// Create a new booking
router.post('/', verifyToken, bookingController.createBooking);

// Get user's bookings
router.get('/', verifyToken, bookingController.getUserBookings);

// Update booking status (For Mandi Admins)
router.put('/status', verifyToken, bookingController.updateStatus);

// Get Mandi Dashboard Stats & Recent Scans
router.get('/mandi/dashboard', verifyToken, bookingController.getMandiDashboard);

// Get Slot Availability
router.get('/slots/availability', verifyToken, bookingController.getSlotAvailability);

// Verify booking time window
router.post('/verify', verifyToken, bookingController.verifyBooking);

// Report emergency delay
router.post('/report-delay', verifyToken, bookingController.reportDelay);

module.exports = router;
