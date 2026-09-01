const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'Farmer'
  },
  role: {
    type: String,
    enum: ['FARMER', 'ADMIN', 'SUPER_ADMIN', 'MANDI_ADMIN', 'BUYER', 'LOGISTICS', 'system_admin', 'mandi_admin'],
    default: 'FARMER'
  },
  mandiId: {
    type: String, // Only for MANDI_ADMIN
    default: null
  },
  profileData: {
    phone: String,
    location: String,
    cropType: String,
    category: {
      type: String,
      enum: ['MARGINAL', 'SMALL', 'LARGE']
    },
    aadharNumber: String,
    bankAccount: String,
    upiId: String
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
