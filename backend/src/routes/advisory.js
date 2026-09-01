const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const advisoryController = require('../controllers/advisoryController');

// GET /api/advisory/history
// Fetch chat history for the logged-in user
router.get('/history', verifyToken, advisoryController.getHistory);

// POST /api/advisory/ask
// Ask a new question to the AI, maintaining context
router.post('/ask', verifyToken, advisoryController.askAdvisory);

// GET /api/advisory/recommend-crops
// Get crop recommendations based on location and weather, with Redis caching
router.get('/recommend-crops', verifyToken, advisoryController.recommendCrops);

module.exports = router;
