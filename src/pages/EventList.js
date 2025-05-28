import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import '../styles/EventList.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/events');
        setEvents(response.data);
      } catch (error) {
        setError('Failed to load events. Please try again.');
        console.error('Fetch events error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-message">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-message">{error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="event-list-container">
        <div className="event-list-header">
          <h2 className="event-list-title">My Events</h2>
          <Link to="/create-event" className="create-event-link">
            Create New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="no-events-message">
            No events found. Create your first event!
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-card-content">
                  <h5 className="event-name">{event.name}</h5>
                  <p className="event-date">
                    <small>
                      {new Date(event.date).toLocaleDateString()}
                    </small>
                  </p>
                  <p className="event-description">{event.description}</p>
                  <Link
                    to={`/events/${event._id}`}
                    className="view-details-link"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default EventList; 