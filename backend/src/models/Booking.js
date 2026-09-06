// backend/src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  farmerId: {
    type: String, // Firebase UID save karenge yahan
    required: true,
    index: true // Faster queries ke liye
  },
  mandiId: {
    type: String,
    required: true,
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
  preferredDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: [
      '06:00 AM - 09:00 AM',
      '09:00 AM - 12:00 PM',
      '12:00 PM - 03:00 PM',
      '03:00 PM - 06:00 PM'
    ]
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'AT_GATE', 'WEIGHING', 'PAYMENT', 'COMPLETED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  slotStartTime: { type: Date },
  slotEndTime: { type: Date },
  isDelayed: { type: Boolean, default: false },
  delayReason: { type: String },
  gracePeriodEndTime: { type: Date },
  delayCount: { type: Number, default: 0 },
  verificationFailed: { type: Boolean, default: false },
  virtualToken: {
    type: String,
    unique: true,
    default: () => 'TK-' + Math.floor(1000 + Math.random() * 9000)
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Booking', bookingSchema);