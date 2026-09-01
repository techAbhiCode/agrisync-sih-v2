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

    await adminRepository.createNotification({
      userId: request.userId,
      type: 'success',
      title: 'Mandi Registration Approved',
      message: `Congratulations! Your registration for ${request.mandiName} has been approved. You are now a Mandi Admin.`,
    });
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
