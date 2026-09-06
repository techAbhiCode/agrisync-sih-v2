const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  preferredCrops: [{
    type: String
  }],
  frequentMandis: [{
    type: String
  }],
  languagePreference: {
    type: String,
    default: 'en'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
