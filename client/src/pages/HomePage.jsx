import { motion } from 'framer-motion';
import { Globe, CheckCircle, XCircle } from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import Loader from '../components/common/Loader';

// Landing Sections
import Hero from '../components/landing/Hero';
import PopularDestinations from '../components/landing/PopularDestinations';
import HowItWorks from '../components/landing/HowItWorks';
import ItineraryPreview from '../components/landing/ItineraryPreview';
import Features from '../components/landing/Features';
import CTA from '../components/landing/CTA';

function HomePage() {
  const { data, isLoading, isError, error } = useHealth();

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Popular Destinations Section */}
      <PopularDestinations />

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. AI Itinerary Preview Section */}
      <ItineraryPreview />

      {/* 5. Features Section */}
      <Features />

      {/* 7. Call To Action (CTA) Section */}
      <CTA />

      {/* 8. API Connectivity Health Check (Bottom verification card) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          maxWidth: '600px',
          margin: '0 auto 4rem',
          padding: '1.5rem',
          background: 'var(--color-surface-light)',
          border: '1px solid var(--color-border)',
          borderRadius: '1rem',
          boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Globe size={16} color="var(--color-secondary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            OdysseusAI Connection Monitor
          </span>
        </div>

        {isLoading && <Loader size={20} />}

        {isError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-error)' }}>
            <XCircle size={16} />
            <span>Connection Offline: {error?.message || 'Server down'}</span>
          </div>
        )}

        {data && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-success)' }}>
            <CheckCircle size={16} />
            <span>OdysseusAI API Connected (Uptime: {Math.floor(data.uptime)}s)</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default HomePage;
