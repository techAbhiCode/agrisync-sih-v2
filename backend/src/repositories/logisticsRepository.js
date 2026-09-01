const TruckBooking = require('../models/TruckBooking');
const Notification = require('../models/Notification');

class LogisticsRepository {
  async createBooking(bookingData) {
    const booking = new TruckBooking(bookingData);
    return await booking.save();
  }

  async findByFarmerId(farmerId) {
    return await TruckBooking.find({ farmerId }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await TruckBooking.findById(id);
  }

  async save(booking) {
    return await booking.save();
  }

  async createNotification(data) {
    const notification = new Notification(data);
    return await notification.save();
  }
}

module.exports = new LogisticsRepository();
