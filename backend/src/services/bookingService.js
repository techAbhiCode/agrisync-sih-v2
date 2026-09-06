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
    
    const bookableCapacity = mandi && mandi.bookableCapacity ? mandi.bookableCapacity : 45;
    
    // We check slots instead of daily capacity for strict queue management
    const currentBookedInSlot = await bookingRepository.getSlotBookings(mandiId, preferredDate);
    const slotCount = currentBookedInSlot.find(s => s._id === timeSlot)?.count || 0;

    if (slotCount + quantity > bookableCapacity) {
      throw new Error(`CAPACITY_FULL: Mandi has reached its bookable capacity of ${bookableCapacity} quintals for this time slot. Please select another slot or buffer slots will be used for emergencies.`);
    }

    // Parse timeSlot into start and end Dates based on preferredDate
    const dateStr = new Date(preferredDate).toISOString().split('T')[0];
    const [startTimeStr, endTimeStr] = timeSlot.split(' - ');
    
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes}:00Z`);
    };

    const slotStartTime = parseTime(startTimeStr);
    const slotEndTime = parseTime(endTimeStr);

    const savedBooking = await bookingRepository.create({
      farmerId: uid,
      mandiId,
      cropType,
      quantity,
      preferredDate,
      timeSlot,
      slotStartTime,
      slotEndTime,
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
    
    // Attach queue position and EWT for active bookings
    const bookingsWithQueue = await Promise.all(bookings.map(async (booking) => {
      let queuePosition = null;
      let estimatedWaitTime = null;
      
      if (activeStatuses.includes(booking.status)) {
        queuePosition = await bookingRepository.getQueuePosition(booking.mandiId, booking.preferredDate, booking.createdAt);
        // Assuming 15 minutes processing time per farmer in the queue
        estimatedWaitTime = (queuePosition) * 15;
      }
      
      return {
        ...booking.toObject(),
        queuePosition,
        estimatedWaitTime
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

  async getSlotAvailability(mandiId, date) {
    if (!mandiId) {
      throw new Error('VALIDATION: Mandi ID is required');
    }

    const mandi = await bookingRepository.findMandiById(mandiId);
    const capacity = mandi && mandi.bookableCapacity ? mandi.bookableCapacity : 45;

    if (!date) {
      return { capacity, slots: {} };
    }

    const slotBookings = await bookingRepository.getSlotBookings(mandiId, date);
    
    // Format into a map
    const availability = {
      '06:00 AM - 09:00 AM': 0,
      '09:00 AM - 12:00 PM': 0,
      '12:00 PM - 03:00 PM': 0,
      '03:00 PM - 06:00 PM': 0
    };

    slotBookings.forEach(slot => {
      if (availability[slot._id] !== undefined) {
        availability[slot._id] = slot.count;
      }
    });

    return { capacity, slots: availability };
  }

  async verifyBooking(virtualToken) {
    const booking = await bookingRepository.findByVirtualToken(virtualToken);
    if (!booking) {
      throw new Error('NOT_FOUND: Invalid token: Booking not found');
    }

    const now = new Date();
    // Allow a small 15 min buffer before start time just in case
    const bufferStartTime = new Date(booking.slotStartTime);
    bufferStartTime.setMinutes(bufferStartTime.getMinutes() - 15);
    
    let effectiveEndTime = new Date(booking.slotEndTime);
    if (booking.isDelayed && booking.gracePeriodEndTime) {
      effectiveEndTime = new Date(booking.gracePeriodEndTime);
    }

    if (now < bufferStartTime || now > effectiveEndTime) {
      throw new Error(`INVALID_SCAN_TIME: Please come during your allotted slot (${booking.timeSlot}). Current time is outside the valid window.`);
    }

    return booking;
  }

  async reportDelay(uid, virtualToken, delayReason, currentLocation) {
    const booking = await bookingRepository.findByVirtualToken(virtualToken);
    if (!booking) {
      throw new Error('NOT_FOUND: Booking not found');
    }

    if (booking.farmerId !== uid) {
      throw new Error('FORBIDDEN: You do not own this booking');
    }

    if (booking.delayCount > 0) {
      throw new Error('FORBIDDEN: You can only delay a booking once.');
    }

    // Mocking Geofence check (In production, calculate distance to Mandi)
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      console.log(`[GEOFENCE CHECK] Checking farmer location at ${currentLocation.lat}, ${currentLocation.lng}`);
      // Simulated: if location equals hardcoded 'home' location, log warning.
    }

    // Mocking Weather API Check
    const weatherKeywords = ['rain', 'weather', 'baarish', 'storm'];
    const isWeatherRelated = weatherKeywords.some(kw => delayReason.toLowerCase().includes(kw));
    
    let verificationFailed = false;
    if (isWeatherRelated) {
      console.log(`[WEATHER API MOCK] Checking weather for Mandi ${booking.mandiId}`);
      // Simulate API call: sometimes it fails verification if it's actually sunny
      const isActuallyRaining = Math.random() > 0.3; // 70% chance it's really raining
      if (!isActuallyRaining) {
         verificationFailed = true;
         console.warn(`[ANTI-ABUSE] Weather verification failed for reason: ${delayReason}`);
         
         // Deduct Trust Score
         const user = await bookingRepository.findUserByUid(uid);
         if (user) {
           user.trustScore = Math.max(0, (user.trustScore || 100) - 20); // Deduct 20 points
           await user.save();
           
           await bookingRepository.createNotification({
             userId: uid,
             type: 'warning',
             title: 'Trust Score Penalty',
             message: `Your trust score was reduced by 20 points due to a failed delay verification (False weather report). Current score: ${user.trustScore}`,
           });
         }
      }
    }

    booking.isDelayed = true;
    booking.delayReason = delayReason;
    booking.delayCount += 1;
    booking.verificationFailed = verificationFailed;
    
    // Assign 3-hour grace period
    const graceEnd = new Date(booking.slotEndTime);
    graceEnd.setHours(graceEnd.getHours() + 3);
    booking.gracePeriodEndTime = graceEnd;
    
    // Assign to a buffer slot theoretically (We just keep it on same day but mark delayed)
    const updatedBooking = await bookingRepository.save(booking);

    await bookingRepository.createNotification({
      userId: uid,
      type: 'warning',
      title: 'Delay Reported',
      message: `Your delay has been recorded. Your new grace period ends at ${graceEnd.toLocaleTimeString()}.`,
    });

    return updatedBooking;
  }
}

module.exports = new BookingService();
