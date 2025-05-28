import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

function Navbar({ hideAuth = false }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (currentUser) {
      navigate('/events');
    } else {
      navigate('/');
    }
  };

  return (
    <nav style={{
      backgroundColor: 'var(--surface-color)',
      boxShadow: 'var(--shadow-sm)',
      padding: '0.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          to={currentUser ? "/events" : "/"} 
          onClick={handleLogoClick}
          style={{
            color: 'var(--primary-color)',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            height: '50px'
          }}
        >
          <img src="/snaplogo.png" alt="EventSnap Organizer Logo" style={{ height: '100%' }} />
        </Link>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--spacing-sm)',
            color: 'var(--text-primary)'
          }}
          className="mobile-menu-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'center'
        }} className={isMenuOpen ? 'mobile-menu-open' : ''}>
          {currentUser && !hideAuth && (
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              alignItems: 'center'
            }}>
              <Link to="/events" style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color 0.2s'
              }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--background-color)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                Events
              </Link>
              <Link to="/create-event" style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color 0.2s'
              }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--background-color)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                Create Event
              </Link>
            </div>
          )}
          
          {!hideAuth && (
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              alignItems: 'center'
            }}>
              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--background-color)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color 0.2s'
                  }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--background-color)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Login
                  </Link>
                  <Link to="/register" style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    textDecoration: 'none',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background-color 0.2s'
                  }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}>
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          
          .container > div:last-child {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--surface-color);
            padding: 0.5rem;
            box-shadow: var(--shadow-md);
            flex-direction: row;
            align-items: stretch;
            justify-content: center;
          }
          
          .mobile-menu-open {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;