const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

class BookingRepository {
  async create(bookingData) {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  async findByFarmerId(farmerId) {
    return await Booking.find({ farmerId }).sort({ createdAt: -1 });
  }

  async findAll() {
    return await Booking.find({});
  }

  async findByVirtualToken(virtualToken) {
    return await Booking.findOne({ virtualToken });
  }

  async save(booking) {
    return await booking.save();
  }

  async findByMandiId(mandiId) {
    return await Booking.find({ mandiId });
  }

  async findCompletedByMandiId(mandiId) {
    return await Booking.find({ mandiId, status: 'COMPLETED' }).sort({ updatedAt: -1 }).limit(10);
  }

  async createNotification(data) {
    return await Notification.create(data);
  }

  async findUserByUid(uid) {
    return await User.findOne({ uid });
  }
}

module.exports = new BookingRepository();
