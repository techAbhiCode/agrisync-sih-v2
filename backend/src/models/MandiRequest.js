const mongoose = require('mongoose');

const mandiRequestSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID
    required: true,
  },
  mandiName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  governmentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  adminComment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MandiRequest', mandiRequestSchema);
