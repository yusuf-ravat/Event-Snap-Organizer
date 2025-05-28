import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import * as faceapi from 'face-api.js';
import { jsPDF } from 'jspdf';
import { Box, Container, Typography, Grid, Button, TextField } from '@mui/material';
import PhotoUpload from './PhotoUpload';

const EventPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [captions, setCaptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState(null);

  // Get share code from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const shareCode = queryParams.get('shareCode');

  const fetchEventData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get permissions from localStorage if using share code
      if (shareCode) {
        const storedPermissions = localStorage.getItem(`event_${id}_permissions`);
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        } else {
          // If no permissions found, redirect back to join page
          navigate(`/join-event/${shareCode}`);
          return;
        }
      }

      // Fetch event details
      const response = await axiosInstance.get(`/events/${id}${shareCode ? `?shareCode=${shareCode}` : ''}`);
      
      if (response.data) {
        setEvent(response.data);
        
        // Fetch photos if user has view permission
        if (permissions?.canView || !shareCode) {
          const photosResponse = await axiosInstance.get(`/photos/event/${id}${shareCode ? `?shareCode=${shareCode}` : ''}`);
          setPhotos(photosResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to view this event');
      } else if (error.response?.status === 404) {
        setError('Event not found');
      } else {
        setError('Failed to load event data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, shareCode, permissions, navigate]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handlePhotosUploaded = (newPhotos) => {
    setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
  };

  const generatePDF = () => {
    if (!permissions?.canDownload) {
      setError('You do not have permission to download photos');
      return;
    }

    const doc = new jsPDF();
    doc.text('Event Highlights', 20, 20);
    let y = 30;
    selectedPhotos.forEach((photo, index) => {
      doc.addImage(photo.url, 'JPEG', 20, y, 50, 50);
      doc.text(captions[photo.url] || 'No caption', 80, y + 25);
      y += 60;
    });
    doc.save(`${event.name}-highlights.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading event details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">Event not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {event.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {event.description}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Date: {new Date(event.date).toLocaleDateString()}
      </Typography>

      {permissions?.canUpload && (
        <Box sx={{ mt: 3 }}>
          <PhotoUpload onPhotosUploaded={handlePhotosUploaded} />
        </Box>
      )}

      {permissions?.canView && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} key={photo._id || index}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={photo.url}
                  alt="Event"
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tags: {photo.tags?.join(', ') || 'No tags'}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add caption"
                  value={captions[photo.url] || ''}
                  onChange={(e) => setCaptions({ ...captions, [photo.url]: e.target.value })}
                  sx={{ mt: 1 }}
                />
                {permissions?.canDownload && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedPhotos([...selectedPhotos, photo])}
                    sx={{ mt: 1 }}
                  >
                    Add to Highlights
                  </Button>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {permissions?.canDownload && selectedPhotos.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="success"
            onClick={generatePDF}
            size="large"
          >
            Generate Highlights PDF
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default EventPage;