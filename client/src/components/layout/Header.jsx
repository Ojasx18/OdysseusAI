import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import SignInButton from './SignInButton';
import SignUpButton from './SignUpButton';

function Header({ onMenuClick }) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleExplore = () => {
    if (window.location.pathname === '/') {
      document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'var(--color-header-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Hamburger Menu (Mobile only, logged in only) */}
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="mobile-menu-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
              }}
            >
              <Menu size={24} />
            </button>
          )}

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                background: 'var(--color-primary)',
                borderRadius: '0.75rem',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plane size={24} color="white" />
            </div>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                letterSpacing: '-0.025em',
              }}
            >
              OdysseusAI
            </span>
          </Link>
        </div>

        {!isLoading && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Theme Toggle Button */}
            <ThemeToggle />
            {/* If logged in, show username and sign out quick action on desktop */}
            {isAuthenticated ? (
              <div
                style={{ display: 'none' }}
                className="desktop-sidebar" // Hide on mobile
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link
                    to="/profile"
                    style={{
                      ...linkStyle,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <User size={16} />
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    style={{
                      ...linkStyle,
                      background: 'none',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              // If logged out, show standard landing page header navigation
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    to="/"
                    style={{
                      ...linkStyle,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Home
                  </Link>
                  <SignInButton onClick={() => navigate('/login')} />
                  <SignUpButton onClick={() => navigate('/register')} />
                </div>
              </>
            )}
          </nav>
        )}
      </div>
    </motion.header>
  );
}

export default Header;
