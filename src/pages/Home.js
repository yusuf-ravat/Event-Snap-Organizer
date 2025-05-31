import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      {/* Hero Section */}
      <section className="home-hero-section" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
      }}>
        <div className="home-hero-overlay"></div>
        <div className="home-hero-content">
          <h1>Capture & Organize Your Event Memories</h1>
          <p className="home-hero-subtitle">
            The smart way to collect, organize, and share photos from your special moments.
            Perfect for weddings, parties, and corporate events.
          </p>
          <div className="hero-cta-buttons">
            <Link to="/create-event" className="cta-button primary">
              Create New Event
            </Link>
            <Link to="/events" className="cta-button secondary">
              View My Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-camera-fill"></i>
            </div>
            <h3>Smart Organization</h3>
            <p>Automatically organize photos by faces, dates, and events using AI technology.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-share-fill"></i>
            </div>
            <h3>Easy Sharing</h3>
            <p>Share your event albums securely with friends and family using unique links.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-stars"></i>
            </div>
            <h3>Event Highlights</h3>
            <p>Create beautiful PDF albums with your favorite photos and captions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-phone"></i>
            </div>
            <h3>Mobile Friendly</h3>
            <p>Access and manage your events from any device with our responsive design.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h3>Secure Storage</h3>
            <p>Your photos are safely stored in the cloud with advanced encryption.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-graph-up"></i>
            </div>
            <h3>Event Analytics</h3>
            <p>Track views, downloads, and engagement with detailed statistics.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-folder-fill"></i>
            </div>
            <h3>Folder Organization</h3>
            <p>Create custom folders to organize your event photos efficiently.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-download"></i>
            </div>
            <h3>Easy Download</h3>
            <p>Download photos individually or in bulk with just one click.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;