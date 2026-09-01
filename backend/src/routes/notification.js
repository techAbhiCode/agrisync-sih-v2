const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

// Get all notifications for the authenticated user
router.get('/', verifyToken, notificationController.getAll);

// Mark a specific notification as read
router.put('/:id/read', verifyToken, notificationController.markRead);

// Mark all notifications as read for the user
router.put('/read-all', verifyToken, notificationController.markAllRead);

// Delete (clear) all notifications for the user
router.delete('/', verifyToken, notificationController.clearAll);

module.exports = router;
