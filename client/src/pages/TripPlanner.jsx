import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import TripPlannerForm from '../components/trip/TripPlannerForm';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function TripPlanner() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
      }}
    >
      {/* Title Header */}
      <motion.div variants={item} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Compass size={28} color="var(--color-primary)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Trip Planner
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Plan Your Next Adventure
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
          Create a personalized, day-by-day travel itinerary with maps, budget summaries, and weather details.
        </p>
      </motion.div>

      {/* Wizard Form */}
      <motion.div variants={item}>
        <TripPlannerForm />
      </motion.div>
    </motion.div>
  );
}

export default TripPlanner;
