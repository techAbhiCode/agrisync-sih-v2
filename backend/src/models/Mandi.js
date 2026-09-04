// backend/src/models/Mandi.js
const mongoose = require('mongoose');

const mandiSchema = new mongoose.Schema({
  mandiId: {
    type: String, // Unique ID for the mandi
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  dailyCapacity: {
    type: Number, // In quintals, e.g., 500
    required: true,
    default: 500 
  },
  operatingHours: {
    type: String,
    default: '06:00 AM - 06:00 PM'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mandi', mandiSchema);
