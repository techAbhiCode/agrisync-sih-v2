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

// Scan a booking token (For Mandi Admins)
router.put('/scan', verifyToken, bookingController.scanToken);

// Get Mandi Dashboard Stats & Recent Scans
router.get('/mandi/dashboard', verifyToken, bookingController.getMandiDashboard);

module.exports = router;
