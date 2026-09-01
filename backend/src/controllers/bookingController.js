const bookingService = require('../services/bookingService');

class BookingController {
  async createBooking(req, res) {
    try {
      const savedBooking = await bookingService.createBooking(req.user.uid, req.body);
      res.status(201).json({
        success: true,
        message: 'Booking slot created successfully',
        booking: savedBooking
      });
    } catch (error) {
      if (error.message.startsWith('VALIDATION:')) {
        return res.status(400).json({ error: error.message.replace('VALIDATION: ', '') });
      }
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  async getUserBookings(req, res) {
    try {
      console.log('Requested UID:', req.user.uid);
      const bookings = await bookingService.getUserBookings(req.user.uid);
      console.log('Found bookings length:', bookings.length);
      res.status(200).json({ success: true, bookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  // TEMP DEBUG - no auth
  async getAllBookings(req, res) {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  }

  async scanToken(req, res) {
    try {
      const { virtualToken } = req.body;
      const updatedBooking = await bookingService.scanToken(req.user.uid, virtualToken);
      res.status(200).json({
        success: true,
        message: 'Token verified successfully',
        booking: updatedBooking
      });
    } catch (error) {
      if (error.message.startsWith('FORBIDDEN:')) {
        return res.status(403).json({ error: error.message.replace('FORBIDDEN: ', '') });
      }
      if (error.message.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ error: error.message.replace('NOT_FOUND: ', '') });
      }
      if (error.message.startsWith('MANDI_MISMATCH:')) {
        return res.status(400).json({ error: error.message.replace('MANDI_MISMATCH: ', '') });
      }
      if (error.message.startsWith('ALREADY_USED:') || error.message.startsWith('REJECTED:')) {
        return res.status(400).json({ error: error.message.split(': ')[1] });
      }
      console.error('Error scanning booking:', error);
      res.status(500).json({ error: 'Failed to process scan' });
    }
  }

  async getMandiDashboard(req, res) {
    try {
      const dashboard = await bookingService.getMandiDashboard(req.user.uid);
      res.status(200).json({ success: true, ...dashboard });
    } catch (error) {
      if (error.message.startsWith('FORBIDDEN:')) {
        return res.status(403).json({ error: error.message.replace('FORBIDDEN: ', '') });
      }
      console.error('Error fetching mandi dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch mandi dashboard data' });
    }
  }
}

module.exports = new BookingController();
