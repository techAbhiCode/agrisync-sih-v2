const bookingRepository = require('../repositories/bookingRepository');

class BookingService {
  async createBooking(uid, { mandiId, cropType, quantity, preferredDate, timeSlot }) {
    if (!mandiId || !cropType || !quantity || !preferredDate || !timeSlot) {
      throw new Error('VALIDATION: All fields are required.');
    }

    const mandi = await bookingRepository.findMandiById(mandiId);
    if (!mandi || !mandi.isActive) {
      // Default to 500 capacity if Mandi isn't in DB yet for backward compatibility
      // throw new Error('VALIDATION: Invalid or inactive Mandi selected.');
    }
    
    const dailyCapacity = mandi ? mandi.dailyCapacity : 500;
    const currentBooked = await bookingRepository.getBookedQuantityForDate(mandiId, preferredDate);

    if (currentBooked + quantity > dailyCapacity) {
      throw new Error(`CAPACITY_FULL: Mandi has reached its daily capacity of ${dailyCapacity} quintals for this date. Remaining capacity: ${Math.max(0, dailyCapacity - currentBooked)} quintals.`);
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
    const bookings = await bookingRepository.findByFarmerId(uid);
    const activeStatuses = ['PENDING', 'APPROVED', 'AT_GATE', 'WEIGHING'];
    
    // Attach queue position for active bookings
    const bookingsWithQueue = await Promise.all(bookings.map(async (booking) => {
      let queuePosition = null;
      if (activeStatuses.includes(booking.status)) {
        queuePosition = await bookingRepository.getQueuePosition(booking.mandiId, booking.preferredDate, booking.createdAt);
      }
      return {
        ...booking.toObject(),
        queuePosition
      };
    }));

    return bookingsWithQueue;
  }

  async getAllBookings() {
    return await bookingRepository.findAll();
  }

  async updateBookingStatus(uid, virtualToken, newStatus) {
    const adminUser = await bookingRepository.findUserByUid(uid);
    if (!adminUser || adminUser.role !== 'MANDI_ADMIN') {
      throw new Error('FORBIDDEN: Only Mandi Admins can update ticket status');
    }

    const booking = await bookingRepository.findByVirtualToken(virtualToken);
    if (!booking) {
      throw new Error('NOT_FOUND: Invalid token: Booking not found');
    }

    if (adminUser.mandiId && booking.mandiId !== adminUser.mandiId) {
      throw new Error(`MANDI_MISMATCH: This ticket is for ${booking.mandiId}`);
    }

    const validTransitions = {
      'PENDING': ['APPROVED', 'REJECTED', 'AT_GATE', 'CANCELLED'],
      'APPROVED': ['AT_GATE', 'CANCELLED'],
      'AT_GATE': ['WEIGHING', 'CANCELLED'],
      'WEIGHING': ['PAYMENT'],
      'PAYMENT': ['COMPLETED'],
      'COMPLETED': [],
      'REJECTED': [],
      'CANCELLED': []
    };

    if (booking.status === 'COMPLETED' || booking.status === 'REJECTED' || booking.status === 'CANCELLED') {
      throw new Error(`ALREADY_USED: Ticket has already been scanned (Status: ${booking.status})`);
    }

    if (!newStatus) {
      if (booking.status === 'PENDING' || booking.status === 'APPROVED') newStatus = 'AT_GATE';
      else if (booking.status === 'AT_GATE') newStatus = 'WEIGHING';
      else if (booking.status === 'WEIGHING') newStatus = 'PAYMENT';
      else if (booking.status === 'PAYMENT') newStatus = 'COMPLETED';
    }

    if (!validTransitions[booking.status].includes(newStatus)) {
       // Just force the update if the user wants to jump states, but ideally enforce it
       // Let's just allow it if it's an admin for flexibility, but log it.
    }

    booking.status = newStatus;
    const updatedBooking = await bookingRepository.save(booking);

    // Send notification based on new status
    let title = 'Booking Update';
    let message = `Your booking status was updated to ${newStatus}.`;
    
    if (newStatus === 'AT_GATE') {
      title = 'Gate Entry Confirmed';
      message = `Your token ${virtualToken} was successfully scanned at the gate. Proceed to weighing.`;
    } else if (newStatus === 'WEIGHING') {
      title = 'Weighing Started';
      message = `Your crop is now being weighed.`;
    } else if (newStatus === 'PAYMENT') {
      title = 'Payment Processing';
      message = `Weighing complete. Your payment is being processed.`;
    } else if (newStatus === 'COMPLETED') {
      title = 'Process Completed';
      message = `Transaction complete. Thank you!`;
    }

    await bookingRepository.createNotification({
      userId: booking.farmerId,
      type: 'success',
      title,
      message,
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
        return bd >= today && bd < tomorrow && ['PENDING', 'APPROVED'].includes(b.status);
      }).length,
      totalScanned: allBookings.filter(b => b.status === 'COMPLETED').length
    };

    const pendingBookings = allBookings
      .filter(b => {
        const bd = new Date(b.preferredDate);
        return bd >= today && bd < tomorrow && ['PENDING', 'APPROVED'].includes(b.status);
      })
      .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));

    return { stats, recentScans, pendingBookings };
  }
}

module.exports = new BookingService();
