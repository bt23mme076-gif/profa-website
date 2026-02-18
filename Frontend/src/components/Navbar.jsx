import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiSettings } from 'react-icons/fi';

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { name: 'About me', hash: '#about' },
    { name: 'Research', hash: '#research' },
    { name: 'Books', hash: '#books' },
    { name: 'Courses', path: '/courses' },
    { name: 'Trainings', path: '/trainings' },
    { name: 'Talk to me', hash: '#contact' },
    { name: 'Newsletter', hash: '#newsletter' },
  ];

  const scrollToSection = (hash) => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (link) => {
    if (link.path) {
      // Navigate to a different page
      navigate(link.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.hash) {
      // Scroll to section on current page or navigate home first
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToSection(link.hash), 100);
      } else {
        scrollToSection(link.hash);
      }
    }
  };

  return (
    <>
      {/* Navbar - Premium Full-Width Style */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          width: '100%',
          padding: '0 4rem', 
          height: '80px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {/* Logo/Brand - Premium Style */}
          <Link to="/" onClick={() => scrollToSection(null)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* IIM-A Logo */}
            <img 
              src="/64b7e6d08d07b_iim,_ahmedabad_logo.svg (1).png" 
              alt="IIM Ahmedabad Logo" 
              style={{ 
                height: '55px', 
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            {/* Text */}
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontFamily: '"Playfair Display", "Georgia", serif', 
                fontWeight: 700, 
                color: '#1a1a1a',
                letterSpacing: '-0.03em',
                margin: 0,
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                PROF. VISHAL GUPTA
              </h1>
              <p style={{
                fontSize: '0.7rem',
                fontFamily: '"Inter", -apple-system, sans-serif',
                color: '#888888',
                margin: '6px 0 0 0',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 500
              }}>
                IIM Ahmedabad
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{ 
                  fontSize: '0.875rem', 
                  fontFamily: '"Inter", -apple-system, sans-serif', 
                  fontWeight: 500, 
                  color: hoveredLink === link.name ? '#1a1a1a' : '#555555',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease',
                  padding: 0,
                  position: 'relative',
                  paddingBottom: '2px'
                }}
              >
                {link.name}
                {hoveredLink === link.name && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#1a1a1a',
                    transition: 'all 0.2s ease'
                  }} />
                )}
              </button>
            ))}
            
            {/* Admin Controls */}
            {isAdmin ? (
              <>
                {/* Dashboard Button */}
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  style={{ 
                    padding: '0.7rem 1.6rem', 
                    backgroundColor: '#ffcc00', 
                    color: '#1a1a1a', 
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5b800';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffcc00';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                >
                  <FiSettings size={14} />
                  DASHBOARD
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{ 
                    padding: '0.7rem 1.6rem', 
                    backgroundColor: '#1a1a1a', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1a1a1a';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                >
                  <FiLogOut size={14} />
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                {/* Newsletter Button */}
                <button
                  onClick={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => scrollToSection('#newsletter'), 100);
                    } else {
                      scrollToSection('#newsletter');
                    }
                  }}
                  style={{ 
                    padding: '0.7rem 1.6rem', 
                    backgroundColor: '#1a1a1a', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#000000';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1a1a1a';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                >
                  JOIN NEWSLETTER
                </button>

                
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '80px' }} />
    </>
  );
}