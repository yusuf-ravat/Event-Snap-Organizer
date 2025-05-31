const mongoose = require('mongoose');
const crypto = require('crypto');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  folders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }],
  sharedUsers: [{
    type: String
  }],
  shareCode: {
    type: String,
    unique: true,
    default: () => {
      // Generate a more memorable code (e.g., WEDDING2025)
      const prefix = ['WEDDING', 'PARTY', 'EVENT', 'PHOTO'][Math.floor(Math.random() * 4)];
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${prefix}${year}${random}`;
    }
  },
  sharePermissions: {
    canUpload: {
      type: Boolean,
      default: true
    },
    canView: {
      type: Boolean,
      default: true
    },
    canDownload: {
      type: Boolean,
      default: true
    }
  },
  shareUrl: String,
  statistics: {
    totalVisitors: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    photoDownloads: [{
      photoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photo'
      },
      downloadCount: {
        type: Number,
        default: 0
      }
    }],
    visitorHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      visitorId: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 