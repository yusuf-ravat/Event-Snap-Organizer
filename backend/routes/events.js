const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// Middleware to verify Firebase token (only for event creators)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Validate share code and get event details
router.get('/share/:shareCode', async (req, res) => {
  try {
    console.log('Received share code:', req.params.shareCode);
    
    // Split the share code into event ID and timestamp
    const [eventId, timestamp] = req.params.shareCode.split('-');
    
    if (!eventId || !timestamp) {
      return res.status(400).json({ message: 'Invalid share code format' });
    }

    // Find event by ID
    const event = await Event.findById(eventId);
    console.log('Found event:', event ? 'yes' : 'no');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if share code matches
    if (event.shareCode !== req.params.shareCode) {
      console.log('Share code mismatch:', {
        stored: event.shareCode,
        received: req.params.shareCode
      });
      return res.status(403).json({ message: 'Invalid share code' });
    }

    // Return event details and permissions
    res.json({
      event,
      permissions: event.sharePermissions || {
        canUpload: true,
        canView: true,
        canDownload: true
      }
    });
  } catch (error) {
    console.error('Share code validation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get all events for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { creator: req.user.uid },
        { sharedUsers: req.user.uid }
      ]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has access
    if (event.creator === req.user.uid || event.sharedUsers.includes(req.user.uid)) {
      return res.json(event);
    }

    // If no direct access, check share code
    const shareCode = req.headers['x-share-code'] || req.query.shareCode;
    if (!shareCode || shareCode !== event.shareCode) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If share code is valid, return event with permissions
    res.json({
      event,
      permissions: event.sharePermissions || {
        canUpload: true,
        canView: true,
        canDownload: true
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Generate share code and QR code for an event
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator !== req.user.uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate a new share code
    const shareCode = uuidv4().slice(0, 8);
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/view/${shareCode}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    
    // Update event with share code
    event.shareCode = shareCode;
    event.shareUrl = shareUrl;
    await event.save();

    res.json({ 
      message: 'Share link generated successfully',
      shareCode,
      shareUrl,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    console.error('Share event error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Public route to access event via share code
router.get('/view/:shareCode', async (req, res) => {
  try {
    const event = await Event.findOne({ shareCode: req.params.shareCode })
      .populate('photos'); // Populate the photos field

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Return event details and photos with download counts
    res.json({
      event: {
        _id: event._id,
        name: event.name,
        description: event.description,
        date: event.date,
        photos: event.photos.map(photo => {
          // Find download count for this photo
          const photoDownload = event.statistics.photoDownloads.find(
            pd => pd.photoId.toString() === photo._id.toString()
          );
          
          return {
            _id: photo._id,
            url: photo.url,
            createdAt: photo.createdAt,
            downloadCount: photoDownload ? photoDownload.downloadCount : 0
          };
        })
      }
    });
  } catch (error) {
    console.error('Share code validation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all events for a creator (requires authentication)
router.get('/creator', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user.uid });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event (requires authentication)
router.post('/', verifyToken, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      creator: req.user.uid
    });
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event (requires authentication)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator !== req.user.uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event (requires authentication)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator !== req.user.uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track photo download for shared event
router.post('/view/:shareCode/photos/:photoId/download', async (req, res) => {
  try {
    const event = await Event.findOne({ shareCode: req.params.shareCode });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update download statistics
    event.statistics.totalDownloads += 1;
    
    // Update photo-specific download count
    const photoDownload = event.statistics.photoDownloads.find(
      pd => pd.photoId.toString() === req.params.photoId
    );
    
    if (photoDownload) {
      photoDownload.downloadCount += 1;
    } else {
      event.statistics.photoDownloads.push({
        photoId: req.params.photoId,
        downloadCount: 1
      });
    }

    await event.save();
    res.json({ message: 'Download tracked successfully' });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get event statistics
router.get('/:id/statistics', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the event creator
    if (event.creator !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to view statistics' });
    }

    res.json({
      statistics: {
        totalVisitors: event.statistics.totalVisitors,
        uniqueVisitors: event.statistics.uniqueVisitors,
        totalDownloads: event.statistics.totalDownloads,
        photoDownloads: event.statistics.photoDownloads
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 