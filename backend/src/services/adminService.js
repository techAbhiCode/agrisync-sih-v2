const adminRepository = require('../repositories/adminRepository');

class AdminService {
  async submitMandiRequest(uid, { mandiName, location, licenseNumber, governmentId }) {
    if (!mandiName || !location || !licenseNumber || !governmentId) {
      throw new Error('VALIDATION: All fields are required.');
    }

    const existingReq = await adminRepository.findPendingRequest(uid);
    if (existingReq) {
      throw new Error('DUPLICATE: You already have a pending Mandi registration request.');
    }

    return await adminRepository.createMandiRequest({
      userId: uid,
      mandiName,
      location,
      licenseNumber,
      governmentId
    });
  }

  async getPendingRequests() {
    const requests = await adminRepository.findAllPendingRequests();
    // Enrich with user data
    return await Promise.all(requests.map(async (r) => {
      const user = await adminRepository.findUserByUid(r.userId);
      return {
        ...r.toObject(),
        applicantName: user?.name || 'Unknown',
        applicantEmail: user?.email || 'Unknown'
      };
    }));
  }

  async approveRequest(id) {
    const request = await adminRepository.findRequestById(id);
    if (!request || request.status !== 'PENDING') {
      throw new Error('NOT_FOUND: Valid pending request not found.');
    }

    request.status = 'APPROVED';
    await adminRepository.saveRequest(request);

    await adminRepository.updateUserToMandiAdmin(request.userId, request.mandiName);

    // Mock coordinates extraction for Hackathon
    // In production, we would use a geocoding API here based on request.location
    const mockLng = 77.1025 + (Math.random() * 0.1); 
    const mockLat = 28.7041 + (Math.random() * 0.1);

    // Create the Mandi Record
    const newMandi = await adminRepository.createMandi({
      _id: request.mandiName, // Using name as ID for now based on legacy logic
      location: request.location,
      geo_location: {
        type: 'Point',
        coordinates: [mockLng, mockLat]
      },
      capacityPerSlot: 50,
      totalCapacity: 50,
      bookableCapacity: 45
    });

    await adminRepository.createNotification({
      userId: request.userId,
      type: 'success',
      title: 'Mandi Registration Approved',
      message: `Congratulations! Your registration for ${request.mandiName} has been approved. You are now a Mandi Admin.`,
    });

    // Notify nearby farmers (within 50km)
    try {
      const nearbyFarmers = await adminRepository.findFarmersNear(mockLng, mockLat, 50000);
      const notifications = nearbyFarmers.map(farmer => ({
        userId: farmer.uid,
        type: 'info',
        title: 'New Mandi Available!',
        message: `A new Mandi (${request.mandiName}) has opened near your location! Check it out for better prices.`
      }));
      // Assuming createNotification can handle arrays or we loop (In our repository it's Notification.create which accepts arrays)
      if (notifications.length > 0) {
        await adminRepository.createNotifications(notifications);
        console.log(`[GEO-ALERT] Notified ${notifications.length} farmers about new Mandi: ${request.mandiName}`);
      }
    } catch (geoErr) {
      console.error('[GEO-ALERT] Failed to notify nearby farmers:', geoErr);
    }
  }

  async rejectRequest(id, comment) {
    const request = await adminRepository.findRequestById(id);
    if (!request || request.status !== 'PENDING') {
      throw new Error('NOT_FOUND: Valid pending request not found.');
    }

    request.status = 'REJECTED';
    request.adminComment = comment || 'Does not meet criteria.';
    await adminRepository.saveRequest(request);

    await adminRepository.createNotification({
      userId: request.userId,
      type: 'warning',
      title: 'Mandi Registration Rejected',
      message: `Your registration for ${request.mandiName} was rejected. Reason: ${request.adminComment}`,
    });
  }
}

module.exports = new AdminService();
