const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author_name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Untitled'
  },
  image_data: {
    type: String,
    required: true
  },
  stroke_history: {
    type: String, // Kept as string to seamlessly match previous JSON.stringify frontend logic
    default: '[]'
  },
  is_private: {
    type: Number, // Frontend passes 0 or 1 currently
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Artwork', artworkSchema);
