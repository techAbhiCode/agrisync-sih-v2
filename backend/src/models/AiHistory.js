const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index to easily fetch the latest context for a user
aiHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AiHistory', aiHistorySchema);
