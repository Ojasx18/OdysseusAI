import { motion } from 'framer-motion';
import { MapPin, Compass } from 'lucide-react';
import Card from '../common/Card';

function PopularDestinations() {
  const destinations = [
    {
      name: 'Bali',
      country: 'Indonesia',
      image: '/images/bali_beach.png',
      tags: ['Relax', 'Nature'],
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      image: '/images/japan_fuji.png',
      tags: ['Culture', 'Tech'],
    },
    {
      name: 'Paris',
      country: 'France',
      image: '/images/paris_eiffel.png',
      tags: ['Romance', 'Art'],
    },
    {
      name: 'Rome',
      country: 'Italy',
      image: '/images/rome_colosseum.png',
      tags: ['History', 'Food'],
    },
  ];

  return (
    <section
      id="destinations"
      style={{
        padding: '5rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '-0.025em',
            marginBottom: '1rem',
          }}
        >
          Popular AI-Generated Trips
        </h2>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--color-text-muted)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Explore trending destinations created and planned by travelers using OdysseusAI.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}
      >
        {destinations.map((dest, idx) => (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card
              padding="sm"
              hoverable={true}
              style={{
                position: 'relative',
                height: '350px',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '0',
              }}
            >
              {/* Background Image */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${dest.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 0,
                }}
                className="destination-card-bg"
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 10%, rgba(15, 23, 42, 0.3) 50%, rgba(15, 23, 42, 0) 100%)',
                  zIndex: 1,
                }}
              />

              {/* Card Details */}
              <div style={{ position: 'relative', zIndex: 2, padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(15, 118, 110, 0.25)',
                        border: '1px solid rgba(15, 118, 110, 0.35)',
                        color: '#2dd4bf',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                  {dest.name}
                </h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <MapPin size={14} color="var(--color-secondary)" />
                  {dest.country}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default PopularDestinations;
