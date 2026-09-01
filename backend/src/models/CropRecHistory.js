const mongoose = require('mongoose');

const cropRecSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  location: {
    type: String,
    required: true
  },
  weather: {
    temp: Number,
    humidity: Number,
    condition: String,
    city: String
  },
  recommendations: [{
    name: String,
    reason: String,
    icon: String
  }],
  expertAdvice: String
}, { timestamps: true });

module.exports = mongoose.model('CropRecHistory', cropRecSchema);
