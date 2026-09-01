const logisticsService = require('../services/logisticsService');

class LogisticsController {
  async bookTruck(req, res) {
    try {
      const booking = await logisticsService.bookTruck(req.user.uid, req.body);
      res.status(201).json({ success: true, booking });
    } catch (error) {
      console.error('Error booking truck:', error);
      res.status(500).json({ error: 'Server error while booking truck.' });
    }
  }

  async getMyBookings(req, res) {
    try {
      const bookings = await logisticsService.getMyBookings(req.user.uid);
      res.status(200).json({ success: true, bookings });
    } catch (error) {
      console.error('Error fetching truck bookings:', error);
      res.status(500).json({ error: 'Server error while fetching bookings.' });
    }
  }

  async updateStatus(req, res) {
    try {
      const booking = await logisticsService.updateStatus(req.params.id, req.body);
      res.status(200).json({ success: true, booking });
    } catch (error) {
      if (error.message.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Server error while updating status.' });
    }
  }
}

module.exports = new LogisticsController();
