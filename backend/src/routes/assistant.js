const express = require('express');
const router = express.Router();
const { processCommand } = require('../controllers/assistantController');
const verifyToken = require('../middlewares/auth');

router.post('/command', verifyToken, processCommand);

module.exports = router;
