import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to EventSnap Organizer</h1>
          <p className="hero-subtitle">Organize, share, and cherish your event memories with ease</p>
          <Link to="/create-event" className="cta-button">
            Create New Event
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid ">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Smart Organization</h3>
            <p>Automatically organize photos by faces, dates, and events using AI technology.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Easy Sharing</h3>
            <p>Share your event albums securely with friends and family using unique links.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Event Highlights</h3>
            <p>Create beautiful PDF albums with your favorite photos and captions.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;