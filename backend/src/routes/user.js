const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Sync User Profile to MongoDB
router.post('/sync', verifyToken, userController.sync);

// Get User Profile
router.get('/profile', verifyToken, userController.getProfile);

// Update User Profile
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;
