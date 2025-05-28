import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import '../styles/EventDetails.css';

function SharedEventView() {
  const { shareCode } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    const fetchSharedEvent = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/events/view/${shareCode}`);
        setEvent(response.data.event);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shared event:', error);
        setError(error.response?.data?.message || 'Failed to load event');
        setLoading(false);
      }
    };

    fetchSharedEvent();
  }, [shareCode]);

  const handleDownload = useCallback(async (photoUrl, photoId) => {
    try {
      await axiosInstance.post(`/events/view/${shareCode}/photos/${photoId}/download`);
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download photo. Please try again.');
    }
  }, [shareCode]);

  const handleViewPhoto = useCallback((photo) => {
    setSelectedPhoto(photo);
    setShowViewer(true);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setShowViewer(false);
    setSelectedPhoto(null);
  }, []);

  const handleNextPhoto = useCallback(() => {
    if (!event?.photos) return;
    const currentIndex = event.photos.findIndex(p => p._id === selectedPhoto._id);
    const nextIndex = (currentIndex + 1) % event.photos.length;
    setSelectedPhoto(event.photos[nextIndex]);
  }, [event, selectedPhoto]);

  const handlePrevPhoto = useCallback(() => {
    if (!event?.photos) return;
    const currentIndex = event.photos.findIndex(p => p._id === selectedPhoto._id);
    const prevIndex = (currentIndex - 1 + event.photos.length) % event.photos.length;
    setSelectedPhoto(event.photos[prevIndex]);
  }, [event, selectedPhoto]);

  const handleKeyDown = useCallback((e) => {
    if (!showViewer) return;
    if (e.key === 'ArrowRight') handleNextPhoto();
    if (e.key === 'ArrowLeft') handlePrevPhoto();
    if (e.key === 'Escape') handleCloseViewer();
  }, [showViewer, handleNextPhoto, handlePrevPhoto, handleCloseViewer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="event-details-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-page">
        <Navbar />
        <div className="error-container">
          <div className="error-message">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <Navbar />
        <div className="error-container">
          <div className="error-message">
            <i className="bi bi-info-circle me-2"></i>
            Event not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <Navbar />
      <div className="hero-section">
        <div className="event-details-container">
          <div className="hero-content">
            <div className="hero-content-left">
              <div className="date-badge">
                <span>
                  <i className="bi bi-calendar3"></i>
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              
              <h1 className="event-title">{event.name}</h1>

              <p className="event-description">{event.description}</p>
            </div>

            <div className="hero-stats">
              <div className="stats-card">
                <div className="stats-icon">
                  <i className="bi bi-images"></i>
                </div>
                <div className="stats-number">
                  {event.photos?.length || 0}
                </div>
                <div className="stats-label">
                  Photos in Gallery
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-gradient"></div>
      </div>

      <div className="gallery-section">
        <div className="event-details-container">
          <div className="gallery-card">
            <div className="gallery-card-body">
              <div className="gallery-header">
                <h4 className="mb-0">Photo Gallery</h4>
                <span>
                  {event.photos?.length || 0} Photos
                </span>
              </div>
              {event.photos && event.photos.length > 0 ? (
                <div className="gallery-scroll-container">
                  <div className="photo-grid">
                    {event.photos.map((photo) => (
                      <div key={photo._id} className="photo-card">
                        <div className="photo-image-container">
                          <img
                            src={photo.url}
                            className="photo-image"
                            alt={`From ${event.name}`}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                            }}
                          />
                          <div className="photo-date">
                            {new Date(photo.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="photo-actions">
                          <button
                            className="btn photo-action-button view-button"
                            onClick={() => handleViewPhoto(photo)}
                          >
                            <i className="bi bi-eye"></i>
                            <span>View</span>
                          </button>
                          <button
                            className="btn photo-action-button download-button"
                            onClick={() => handleDownload(photo.url, photo._id)}
                          >
                            <i className="bi bi-download"></i>
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-gallery">
                  <div className="empty-gallery-icon">
                    <i className="bi bi-images"></i>
                  </div>
                  <h5 className="text-muted">No photos yet</h5>
                  <p className="text-muted">Photos will appear here when they are uploaded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showViewer && selectedPhoto && (
        <div className="image-viewer">
          <div className="viewer-overlay" onClick={handleCloseViewer}></div>
          <div className="viewer-content">
            <button className="viewer-close" onClick={handleCloseViewer}>
              <i className="bi bi-x"></i>
            </button>
            <button className="viewer-nav prev" onClick={handlePrevPhoto}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <img src={selectedPhoto.url} alt="Full size" />
            <button className="viewer-nav next" onClick={handleNextPhoto}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedEventView; 