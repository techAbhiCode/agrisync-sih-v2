const Notification = require('../models/Notification');

class NotificationRepository {
  async findByUserId(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async markAsRead(id, userId) {
    return await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  async clearAll(userId) {
    return await Notification.deleteMany({ userId });
  }
}

module.exports = new NotificationRepository();
