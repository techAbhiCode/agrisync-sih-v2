const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Mandi = require('../models/Mandi');

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
    return await Booking.find({ 
      mandiId, 
      status: { $in: ['AT_GATE', 'WEIGHING', 'PAYMENT', 'COMPLETED'] }
    }).sort({ updatedAt: -1 }).limit(10);
  }

  async createNotification(data) {
    return await Notification.create(data);
  }

  async findUserByUid(uid) {
    return await User.findOne({ uid });
  }

  async findMandiById(mandiId) {
    return await Mandi.findOne({ mandiId });
  }

  async getBookedQuantityForDate(mandiId, preferredDate) {
    const startOfDay = new Date(preferredDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const result = await Booking.aggregate([
      {
        $match: {
          mandiId: mandiId,
          preferredDate: { $gte: startOfDay, $lt: endOfDay },
          status: { $nin: ['REJECTED', 'CANCELLED'] }
        }
      },
      {
        $group: {
          _id: null,
          totalBooked: { $sum: '$quantity' }
        }
      }
    ]);
    return result.length > 0 ? result[0].totalBooked : 0;
  }

  async getQueuePosition(mandiId, preferredDate, bookingCreatedAt) {
    const startOfDay = new Date(preferredDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const position = await Booking.countDocuments({
      mandiId,
      preferredDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['PENDING', 'APPROVED', 'AT_GATE', 'WEIGHING'] },
      createdAt: { $lt: bookingCreatedAt }
    });
    
    // Position is number of people ahead + 1
    return position + 1;
  }
}

module.exports = new BookingRepository();
