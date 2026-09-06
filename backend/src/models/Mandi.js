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
  capacityPerSlot: {
    type: Number,
    default: 50 // Legacy/General limit
  },
  totalCapacity: {
    type: Number,
    default: 50 // For Buffer slot logic
  },
  bookableCapacity: {
    type: Number,
    default: 45 // 5 slots reserved for Buffer
  },
  geo_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add a 2dsphere index for geospatial queries
mandiSchema.index({ geo_location: '2dsphere' });

module.exports = mongoose.model('Mandi', mandiSchema);
