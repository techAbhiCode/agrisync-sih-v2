const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const insightsController = require('../controllers/insightsController');

// GET /api/insights/market
// Returns market chart data + AI-generated Spoilage Alerts and Predictions
router.get('/market', verifyToken, insightsController.getMarket);

// GET /api/insights/mandi-prices
// Fetches/Generates latest realistic mandi prices using Gemini based on state and district
router.get('/mandi-prices', verifyToken, insightsController.getMandiPrices);

module.exports = router;
