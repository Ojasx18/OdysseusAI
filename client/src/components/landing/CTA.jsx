import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

function CTA() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        padding: '5rem 1.5rem 8rem',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card
          gradient={true}
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            border: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient light inside card */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 118, 110, 0.08)',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--color-text)',
                letterSpacing: '-0.025em',
                marginBottom: '1rem',
              }}
            >
              Ready to plan your next getaway?
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--color-text-muted)',
                maxWidth: '550px',
                margin: '0 auto 2.5rem',
                lineHeight: 1.6,
              }}
            >
              Join thousands of travelers planning their dream trips with custom AI-generated itineraries.
            </p>

            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              size="lg"
              icon={Compass}
            >
              Start Planning Now
            </Button>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

export default CTA;
