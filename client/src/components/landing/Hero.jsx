import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Compass as CompassIcon } from 'lucide-react';
import Button from '../common/Button';
import ExploreButton from '../layout/ExploreButton';

function Hero() {
  const navigate = useNavigate();

  const handlePlanClick = () => {
    navigate('/login');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient light effects */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 118, 110, 0.08)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          backgroundColor: 'rgba(14, 165, 233, 0.08)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '850px',
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(15, 118, 110, 0.06)',
            border: '1px solid rgba(15, 118, 110, 0.15)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            marginBottom: '2rem',
          }}
        >
          <CompassIcon size={16} className="animate-spin-slow" />
          The Future of Travel Planning
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(2.75rem, 6.5vw, 4.75rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            color: 'var(--color-text)',
          }}
        >
          Your next adventure,
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            planned by AI.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: '0 auto 2.5rem',
          }}
        >
          Create personalized travel itineraries based on your budget, interests, travel style and schedule.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={handlePlanClick}
            variant="primary"
            size="lg"
            icon={Compass}
          >
            Plan My Trip
          </Button>
          <ExploreButton
            onClick={() => {
              document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;
