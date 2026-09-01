const MandiRequest = require('../models/MandiRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

class AdminRepository {
  async findPendingRequest(userId) {
    return await MandiRequest.findOne({ userId, status: 'PENDING' });
  }

  async createMandiRequest(data) {
    const request = new MandiRequest(data);
    return await request.save();
  }

  async findAllPendingRequests() {
    return await MandiRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
  }

  async findRequestById(id) {
    return await MandiRequest.findById(id);
  }

  async saveRequest(request) {
    return await request.save();
  }

  async findUserByUid(uid) {
    return await User.findOne({ uid });
  }

  async updateUserToMandiAdmin(uid, mandiName) {
    return await User.findOneAndUpdate(
      { uid },
      { role: 'MANDI_ADMIN', mandiId: mandiName }
    );
  }

  async createNotification(data) {
    return await Notification.create(data);
  }
}

module.exports = new AdminRepository();
