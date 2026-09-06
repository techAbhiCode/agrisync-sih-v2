const MandiRequest = require('../models/MandiRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Mandi = require('../models/Mandi');

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

  async createNotifications(dataArray) {
    return await Notification.insertMany(dataArray);
  }

  async createMandi(data) {
    const mandi = new Mandi(data);
    return await mandi.save();
  }

  async findFarmersNear(lng, lat, maxDistanceInMeters = 50000) {
    // Requires geo_location 2dsphere index on User
    return await User.find({
      geo_location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistanceInMeters
        }
      },
      role: 'FARMER'
    });
  }
}

module.exports = new AdminRepository();
