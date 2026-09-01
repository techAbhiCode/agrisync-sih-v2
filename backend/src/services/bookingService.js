const bookingRepository = require('../repositories/bookingRepository');

class BookingService {
  async createBooking(uid, { mandiId, cropType, quantity, preferredDate, timeSlot }) {
    if (!mandiId || !cropType || !quantity || !preferredDate || !timeSlot) {
      throw new Error('VALIDATION: All fields are required.');
    }

    const savedBooking = await bookingRepository.create({
      farmerId: uid,
      mandiId,
      cropType,
      quantity,
      preferredDate,
      timeSlot,
      status: 'PENDING'
    });

    await bookingRepository.createNotification({
      userId: uid,
      type: 'success',
      title: 'Booking Confirmed',
      message: `Your booking for ${quantity} quintals of ${cropType} on ${preferredDate} at ${timeSlot} is confirmed.`,
    });

    return savedBooking;
  }

  async getUserBookings(uid) {
    return await bookingRepository.findByFarmerId(uid);
  }

  async getAllBookings() {
    return await bookingRepository.findAll();
  }

  async scanToken(uid, virtualToken) {
    const adminUser = await bookingRepository.findUserByUid(uid);
    if (!adminUser || adminUser.role !== 'MANDI_ADMIN') {
      throw new Error('FORBIDDEN: Only Mandi Admins can scan tickets');
    }

    const booking = await bookingRepository.findByVirtualToken(virtualToken);
    if (!booking) {
      throw new Error('NOT_FOUND: Invalid token: Booking not found');
    }

    if (adminUser.mandiId && booking.mandiId !== adminUser.mandiId) {
      throw new Error(`MANDI_MISMATCH: This ticket is for ${booking.mandiId}`);
    }

    if (booking.status === 'COMPLETED') {
      throw new Error('ALREADY_USED: Ticket has already been used');
    }
    if (booking.status === 'REJECTED') {
      throw new Error('REJECTED: Ticket is rejected');
    }

    booking.status = 'COMPLETED';
    const updatedBooking = await bookingRepository.save(booking);

    await bookingRepository.createNotification({
      userId: booking.farmerId,
      type: 'success',
      title: 'Gate Entry Confirmed',
      message: `Your token ${virtualToken} was successfully scanned at ${booking.mandiId}.`,
    });

    return updatedBooking;
  }

  async getMandiDashboard(uid) {
    const adminUser = await bookingRepository.findUserByUid(uid);
    if (!adminUser || adminUser.role !== 'MANDI_ADMIN') {
      throw new Error('FORBIDDEN: Only Mandi Admins can access dashboard data');
    }

    const mandiId = adminUser.mandiId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allBookings = await bookingRepository.findByMandiId(mandiId);
    const recentScans = await bookingRepository.findCompletedByMandiId(mandiId);

    const stats = {
      expectedToday: allBookings.filter(b => {
        const bd = new Date(b.preferredDate);
        return bd >= today && bd < tomorrow;
      }).length,
      completedToday: allBookings.filter(b => {
        const bd = new Date(b.preferredDate);
        return bd >= today && bd < tomorrow && b.status === 'COMPLETED';
      }).length,
      pendingToday: allBookings.filter(b => {
        const bd = new Date(b.preferredDate);
        return bd >= today && bd < tomorrow && b.status === 'PENDING';
      }).length,
      totalScanned: allBookings.filter(b => b.status === 'COMPLETED').length
    };

    const pendingBookings = allBookings
      .filter(b => {
        const bd = new Date(b.preferredDate);
        return bd >= today && bd < tomorrow && b.status === 'PENDING';
      })
      .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));

    return { stats, recentScans, pendingBookings };
  }
}

module.exports = new BookingService();
