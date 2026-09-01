const logisticsRepository = require('../repositories/logisticsRepository');

class LogisticsService {
  async bookTruck(uid, { truckId, pickupLocation, destinationMandi, driverName, vehicleNumber, cropType, quantity, cost }) {
    const newBooking = await logisticsRepository.createBooking({
      farmerId: uid,
      truckId,
      pickupLocation,
      destinationMandi,
      driverName,
      vehicleNumber,
      cropType,
      quantity,
      cost,
      status: 'PENDING',
      timeline: [{
        status: 'PENDING',
        description: 'Booking request sent to logistics provider.'
      }]
    });

    await logisticsRepository.createNotification({
      userId: uid,
      title: 'Truck Booking Confirmed',
      message: `Your truck (${vehicleNumber}) has been booked successfully for ${cropType}. Status: PENDING.`,
      type: 'INFO'
    });

    return newBooking;
  }

  async getMyBookings(uid) {
    return await logisticsRepository.findByFarmerId(uid);
  }

  async updateStatus(id, { status, description }) {
    const booking = await logisticsRepository.findById(id);
    if (!booking) {
      throw new Error('NOT_FOUND: Booking not found.');
    }

    booking.status = status;
    booking.timeline.push({
      status,
      description: description || `Status updated to ${status}`
    });

    return await logisticsRepository.save(booking);
  }
}

module.exports = new LogisticsService();
