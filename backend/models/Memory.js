const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: null, // Cloudinary public_id, useful for deleting images
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Stored as a date string (e.g. YYYY-MM-DD)
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Memory', memorySchema);
