const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  faces: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    label: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema); 