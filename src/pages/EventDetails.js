import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import '../styles/EventDetails.css';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [shareInfo, setShareInfo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [statistics, setStatistics] = useState(null);

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/events/${id}`);
      setEvent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error details:', error);
      setError(error.response?.data?.message || 'Failed to fetch event details');
      setLoading(false);
    }
  }, [id]);

  const fetchEventAndPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch event details
      await fetchEventDetails();

      // Fetch photos separately
      const photosResponse = await axiosInstance.get(`/photos/event/${id}`);
      setPhotos(photosResponse.data || []);
    } catch (error) {
      console.error('Fetch error details:', error);
      if (error.response?.status === 404) {
        setError(`Event not found: ${error.response.data?.message}`);
        setTimeout(() => navigate('/events'), 2000);
      } else if (error.response?.status === 401) {
        setError('Please login to view this event');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Failed to load event details: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchEventDetails]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/events/${id}/statistics`);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Only show error if it's not a 403 (unauthorized) error
      if (error.response?.status !== 403) {
        setError('Failed to load event statistics. Please try again.');
      }
    }
  }, [id]);

  useEffect(() => {
    fetchEventAndPhotos();
  }, [fetchEventAndPhotos]);

  useEffect(() => {
    if (event?.creator === auth.currentUser?.uid) {
      fetchStatistics();
    }
  }, [event, fetchStatistics]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError('');
    const newUploadProgress = {};

    try {
      // Upload files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('eventId', id);

        // Update progress for this file
        newUploadProgress[file.name] = 0;
        setUploadProgress({ ...newUploadProgress });

        const response = await axiosInstance.post('/photos/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            newUploadProgress[file.name] = progress;
            setUploadProgress({ ...newUploadProgress });
          }
        });

        setPhotos(prevPhotos => [...prevPhotos, response.data]);
      }

      setSelectedFiles([]);
      // Refresh statistics after upload
      if (event?.creator === auth.currentUser?.uid) {
        fetchStatistics();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeSelectedFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/events/${id}/share`);
      setShareInfo(response.data);
      setShowShareModal(true);
    } catch (error) {
      console.error('Share error:', error);
      setError('Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show a temporary success message
      const originalText = document.querySelector('.share-button').textContent;
      const button = document.querySelector('.share-button');
      button.innerHTML = '<i class="bi bi-check2 me-2"></i>Copied!';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    });
  };

  const handleDownload = async (photoUrl, photoId) => {
    try {
      // Track the download
      await axiosInstance.post(`/events/${id}/photos/${photoId}/download`);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = photoUrl;
      link.download = `photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh statistics
      fetchStatistics();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Attempting to delete photo with ID:', photoId);
      setLoading(true);
      
      const response = await axiosInstance.delete(`/photos/${photoId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.message === 'Photo deleted successfully') {
        // Remove the photo from the state
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
        // Show success message
        setError('');
        console.log('Photo successfully removed from state');
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        photoId
      });
      setError(error.response?.data?.message || 'Failed to delete photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-message">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-message">
            <i className="bi bi-info-circle me-2"></i>
            Event not found
          </div>
        </div>
      </>
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

              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleShare}
                >
                  <i className="bi bi-share"></i>
                  Share Event
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => document.getElementById('photoUpload').click()}
                >
                  <i className="bi bi-cloud-upload"></i>
                  Upload Photos
                </button>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stats-card">
                <div className="stats-icon">
                  <i className="bi bi-images"></i>
                </div>
                <div className="stats-number">
                  {photos.length}
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

      {event?.creator === auth.currentUser?.uid && statistics && (
        <div className="statistics-section">
          <div className="event-details-container">
            <div className="statistics-container">
              <div className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-content">
                    <div className="stat-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div>
                      <h6 className="stat-label">Total Visitors</h6>
                      <h3 className="stat-value">{statistics.totalVisitors}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-content">
                    <div className="stat-icon">
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <h6 className="stat-label">Unique Visitors</h6>
                      <h3 className="stat-value">{statistics.uniqueVisitors}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-content">
                    <div className="stat-icon">
                      <i className="bi bi-download"></i>
                    </div>
                    <div>
                      <h6 className="stat-label">Total Downloads</h6>
                      <h3 className="stat-value">{statistics.totalDownloads}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="upload-section">
        <div className="event-details-container">
          <div className="upload-card">
            <div className="upload-card-body">
              <div className="upload-header">
                <h4 className="upload-title">
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload Photos
                </h4>
                <p className="upload-subtitle">Share your memories from this event</p>
              </div>
              
              <div className="upload-area" onClick={() => document.getElementById('photoUpload').click()}>
                <input
                  id="photoUpload"
                  type="file"
                  className="upload-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  multiple
                />
                <div className="upload-placeholder">
                  <i className="bi bi-cloud-arrow-up upload-icon"></i>
                  <p className="upload-text">Drag & drop photos here or click to browse</p>
                  <p className="upload-hint">Supports JPG, PNG up to 10MB</p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="selected-files-section">
                  <div className="selected-files-header">
                    <h6>Selected Files ({selectedFiles.length})</h6>
                    <button 
                      className="btn btn-link text-danger p-0"
                      onClick={() => setSelectedFiles([])}
                      disabled={uploading}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="selected-files-container">
                    {selectedFiles.map((file) => (
                      <div key={file.name} className="selected-file-item">
                        <div className="file-preview">
                          <div className="file-info">
                            <i className="bi bi-image file-icon"></i>
                            <div className="file-details">
                              <p className="file-name">{file.name}</p>
                              <small className="file-size">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </small>
                            </div>
                          </div>
                          <div className="file-actions">
                            {uploadProgress[file.name] !== undefined && (
                              <div className="upload-progress">
                                <div className="progress">
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${uploadProgress[file.name]}%` }}
                                    aria-valuenow={uploadProgress[file.name]}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  >
                                    {uploadProgress[file.name]}%
                                  </div>
                                </div>
                              </div>
                            )}
                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill"
                              onClick={() => removeSelectedFile(file.name)}
                              disabled={uploading}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="upload-actions">
                <button
                  className={`btn btn-lg upload-button ${uploading ? 'uploading' : ''}`}
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                >
                  <div className="button-content">
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload"></i>
                        <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gallery-section">
        <div className="event-details-container">
          <div className="gallery-card">
            <div className="gallery-card-body">
              <div className="gallery-header">
                <h4 className="mb-0">Photo Gallery</h4>
                <span>
                  {photos.length} Photos
                </span>
              </div>
              {photos && photos.length > 0 ? (
                <div className="gallery-scroll-container">
                  <div className="photo-grid">
                    {photos.map((photo) => (
                      <div key={photo._id} className="photo-card">
                        <div className="photo-image-container">
                          <img
                            src={photo.url}
                            className="photo-image"
                            alt={`From ${event.name}`}
                          />
                          <div className="photo-date">
                            {new Date(photo.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="photo-actions">
                          {event?.creator === auth.currentUser?.uid ? (
                            <div className="photo-action-buttons">
                              <button
                                className="btn photo-action-button delete-button"
                                onClick={() => handleDeletePhoto(photo._id)}
                              >
                                <i className="bi bi-trash"></i>
                                <span>Delete</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn photo-action-button download-button"
                              onClick={() => handleDownload(photo.url, photo._id)}
                            >
                              <i className="bi bi-download"></i>
                              <span>Download</span>
                            </button>
                          )}
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
                  <p className="text-muted">Upload your first photo to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && shareInfo && (
        <div className="share-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Share Event</h5>
              <button
                type="button"
                style={{
                  backgroundColor: '#dc3545', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '10%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                onClick={() => setShowShareModal(false)}
              >
                <i className="bi bi-x fs-5"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="text-center">
                <img 
                  src={shareInfo.qrCode} 
                  alt="QR Code" 
                  className="qr-code"
                />
              </div>
              <div className="share-input-group">
                <label className="form-label">Share Link</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg share-input"
                    value={shareInfo.shareUrl}
                    readOnly
                  />
                  <button
                    className="btn btn-primary px-4 share-button"
                    type="button"
                    onClick={() => copyToClipboard(shareInfo.shareUrl)}
                  >
                    <i className="bi bi-clipboard me-2"></i>
                    Copy
                  </button>
                </div>
              </div>
              <div className="share-input-group">
                <label className="form-label">Share Code</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg share-input"
                    value={shareInfo.shareCode}
                    readOnly
                  />
                  <button
                    className="btn btn-primary px-4 share-button"
                    type="button"
                    onClick={() => copyToClipboard(shareInfo.shareCode)}
                  >
                    <i className="bi bi-clipboard me-2"></i>
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light px-4 close-button"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails; 