// backend/src/models/TruckBooking.js
const mongoose = require('mongoose');

const truckBookingSchema = new mongoose.Schema({
  farmerId: {
    type: String, // Firebase UID
    required: true,
    index: true
  },
  truckId: {
    type: Number,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1 quintal']
  },
  destinationMandi: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  virtualToken: {
    type: String,
    unique: true,
    default: () => 'TRK-' + Math.floor(1000 + Math.random() * 9000)
  },
  timeline: [
    {
      status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] 
      },
      timestamp: { type: Date, default: Date.now },
      description: { type: String }
    }
  ]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('TruckBooking', truckBookingSchema);
