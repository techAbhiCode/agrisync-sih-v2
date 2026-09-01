const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const verifySuperAdmin = require('../middlewares/superAdmin');
const adminController = require('../controllers/adminController');

// --- PUBLIC ROUTES (For any logged in user) ---

// Submit a Mandi Registration Request
router.post('/mandi-request', verifyToken, adminController.submitMandiRequest);

// --- SUPER ADMIN ROUTES ---

// Get all pending requests
router.get('/mandi-requests', verifyToken, verifySuperAdmin, adminController.getPendingRequests);

// Approve a request
router.put('/mandi-requests/:id/approve', verifyToken, verifySuperAdmin, adminController.approveRequest);

// Reject a request
router.put('/mandi-requests/:id/reject', verifyToken, verifySuperAdmin, adminController.rejectRequest);

module.exports = router;
