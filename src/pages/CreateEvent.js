import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import '../styles/CreateEvent.css';
// Removed unused bcrypt import if it's not used for hashing on the frontend
// import bcrypt from 'bcryptjs'; 

function CreateEvent() {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (isPrivate && !password) {
      setError('Password is required for private events');
      return;
    }

    try {
      // Hashing should ideally be done on the backend
      // const hashedPassword = isPrivate ? await bcrypt.hash(password, 10) : undefined;

      await axiosInstance.post('/events', {
        name,
        date,
        description,
        isPrivate,
        password: isPrivate ? password : undefined // Send plain password for backend hashing
      });

      navigate('/events');
    } catch (error) {
      setError('Failed to create event. Please try again.');
      console.error('Create event error:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-event-page">
        <div className="create-event-container">
          <div className="create-event-card">
            <h2 className="create-event-title">Create New Event</h2>
            
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-event-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eventName" className="form-label">Event Name</label>
                  <input
                    type="text"
                    id="eventName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventDate" className="form-label">Event Date</label>
                  <input
                    type="date"
                    id="eventDate"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <label htmlFor="isPrivate" className="checkbox-label">
                  Make this event private
                </label>
              </div>

              {isPrivate && (
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Access Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              )}

              <button type="submit" className="submit-button">
                Create Event
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateEvent; 