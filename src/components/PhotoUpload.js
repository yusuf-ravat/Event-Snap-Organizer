import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function PhotoUpload() {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      await axiosInstance.post(`/events/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Photo uploaded successfully!');
      setSelectedFile(null);
      // Reset file input
      document.getElementById('photoInput').value = '';
    } catch (error) {
      setError('Failed to upload photo. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Upload Photo</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <div className="mb-3">
                <label htmlFor="photoInput" className="form-label">Select Photo</label>
                <input
                  type="file"
                  className="form-control"
                  id="photoInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>

              <div className="text-center">
                <button
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={loading || !selectedFile}
                >
                  {loading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoUpload; 