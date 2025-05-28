import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function JoinEvent() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleJoinEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/events/view/${shareCode}`);
      // Store the share code in localStorage for future requests
      localStorage.setItem(`event_${response.data.event._id}_shareCode`, shareCode);
      // Navigate to the event details page
      navigate(`/events/${response.data.event._id}`);
    } catch (error) {
      console.error('Error joining event:', error);
      setError(error.response?.data?.message || 'Failed to join event');
      setLoading(false);
    }
  }, [shareCode, navigate]);

  useEffect(() => {
    handleJoinEvent();
  }, [handleJoinEvent]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Joining event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return null;
}

export default JoinEvent; 