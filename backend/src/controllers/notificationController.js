const notificationService = require('../services/notificationService');

class NotificationController {
  async getAll(req, res) {
    try {
      const notifications = await notificationService.getAll(req.user.uid);
      res.status(200).json({ success: true, notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async markRead(req, res) {
    try {
      const notification = await notificationService.markRead(req.params.id, req.user.uid);
      res.status(200).json({ success: true, notification });
    } catch (error) {
      if (error.message.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  }

  async markAllRead(req, res) {
    try {
      await notificationService.markAllRead(req.user.uid);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  }

  async clearAll(req, res) {
    try {
      await notificationService.clearAll(req.user.uid);
      res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ error: 'Failed to clear notifications' });
    }
  }
}

module.exports = new NotificationController();
