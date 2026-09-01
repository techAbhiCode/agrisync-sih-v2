const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const advisoryHistorySchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('AdvisoryHistory', advisoryHistorySchema);