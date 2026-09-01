const router = require('express').Router();
const verifyToken = require('../middlewares/auth');
const logisticsController = require('../controllers/logisticsController');

// 1. Create a new Truck Booking
router.post('/book', verifyToken, logisticsController.bookTruck);

// 2. Get all bookings for the logged-in user
router.get('/my-bookings', verifyToken, logisticsController.getMyBookings);

// 3. Admin/Driver route to update status (Simulation)
router.put('/:id/status', verifyToken, logisticsController.updateStatus);

module.exports = router;
