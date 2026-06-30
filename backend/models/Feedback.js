const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 3, // For ⭐, ⭐⭐, ⭐⭐⭐
  },
  ipAddress: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
