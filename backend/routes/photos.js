const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Photo = require('../models/Photo');
const Event = require('../models/Event');
const admin = require('firebase-admin');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify Firebase token
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

// Helper function to check event access
const checkEventAccess = async (eventId, userId, shareCode) => {
  const event = await Event.findById(eventId);
  if (!event) {
    return { hasAccess: false, error: 'Event not found' };
  }

  // Check if user is authenticated and has access
  if (userId) {
    if (event.creator === userId || event.sharedUsers.includes(userId)) {
      return { hasAccess: true, event };
    }
  }

  // Check share code
  if (shareCode && shareCode === event.shareCode) {
    return { hasAccess: true, event };
  }

  return { hasAccess: false, error: 'Access denied' };
};

// Upload a photo
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { eventId } = req.body;
    let userId = null;
    let shareCode = null;

    // Check for authentication token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        // Token verification failed, continue to check share code
      }
    }

    // Check for share code
    shareCode = req.headers['x-share-code'];

    const { hasAccess, error, event } = await checkEventAccess(eventId, userId, shareCode);

    if (!hasAccess) {
      return res.status(403).json({ message: error });
    }

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `events/${eventId}`,
      resource_type: 'auto'
    });

    // Create photo document
    const photo = new Photo({
      event: eventId,
      cloudinaryId: result.public_id,
      url: result.secure_url,
      uploadedBy: userId || 'anonymous', // Store anonymous for share code uploads
      uploadMethod: userId ? 'authenticated' : 'share_code'
    });

    const savedPhoto = await photo.save();

    // Add photo to event
    event.photos.push(savedPhoto._id);
    await event.save();

    res.status(201).json(savedPhoto);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get photos for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    let userId = null;

    // Try to get user ID if token exists
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        // Token verification failed, continue with share code check
      }
    }

    const shareCode = req.query.shareCode;
    const { hasAccess, error, event } = await checkEventAccess(req.params.eventId, userId, shareCode);

    if (!hasAccess) {
      return res.status(403).json({ message: error });
    }

    const photos = await Photo.find({ event: req.params.eventId });
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a photo
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    console.log('Attempting to delete photo with ID:', req.params.id);
    
    // First find the photo to get its event ID
    const photo = await Photo.findById(req.params.id);
    console.log('Found photo:', photo ? 'Yes' : 'No');
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    console.log('Photo event ID:', photo.event);

    // Find the event using the photo's event ID
    const event = await Event.findById(photo.event);
    console.log('Found event:', event ? 'Yes' : 'No');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the event creator
    console.log('User ID:', req.user.uid);
    console.log('Event creator:', event.creator);
    
    if (event.creator !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to delete this photo' });
    }

    // Delete from Cloudinary
    if (photo.cloudinaryId) {
      try {
        console.log('Deleting from Cloudinary:', photo.cloudinaryId);
        await cloudinary.uploader.destroy(photo.cloudinaryId);
        console.log('Cloudinary deletion successful');
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }

    // Remove photo from event's photos array
    event.photos = event.photos.filter(p => p.toString() !== photo._id.toString());
    await event.save();
    console.log('Photo removed from event');

    // Delete the photo document
    await Photo.findByIdAndDelete(photo._id);
    console.log('Photo document deleted');

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid photo ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update photo tags
router.put('/:id/tags', verifyToken, async (req, res) => {
  try {
    const { tags } = req.body;
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const { hasAccess, error, event } = await checkEventAccess(photo.event, req.user.uid);

    if (!hasAccess) {
      return res.status(403).json({ message: error });
    }

    photo.tags = tags;
    const updatedPhoto = await photo.save();
    res.json(updatedPhoto);
  } catch (error) {
    console.error('Update tags error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 