const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async getAll(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async markRead(id, userId) {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw new Error('NOT_FOUND: Notification not found');
    }
    return notification;
  }

  async markAllRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async clearAll(userId) {
    return await notificationRepository.clearAll(userId);
  }
}

module.exports = new NotificationService();
