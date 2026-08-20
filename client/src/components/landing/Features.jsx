import { motion } from 'framer-motion';
import { Compass, Map, CloudSun, CreditCard } from 'lucide-react';
import Card from '../common/Card';

function Features() {
  const features = [
    {
      title: 'AI Travel Assistant',
      description: 'Personalized planning taking into account your budget, pace, travel companions, and preferred style.',
      icon: Compass,
      bgColor: 'var(--color-primary-light)',
      iconColor: 'var(--color-primary)',
    },
    {
      title: 'OpenStreetMap Routing',
      description: 'Real-time routes and distance computations mapped using Nominatim, OSRM, and Leaflet layers.',
      icon: Map,
      bgColor: 'var(--color-secondary-light)',
      iconColor: 'var(--color-secondary)',
    },
    {
      title: 'Weather Integration',
      description: 'Fetch historical and real-time weather forecasts to optimize your packing list and seasonal plan.',
      icon: CloudSun,
      bgColor: 'rgba(245, 158, 11, 0.15)',
      iconColor: 'var(--color-accent)',
    },
    {
      title: 'Budget Planner',
      description: 'Calculate average trip expenses, track activity prices, and prevent budget overruns automatically.',
      icon: CreditCard,
      bgColor: 'rgba(22, 163, 74, 0.15)',
      iconColor: 'var(--color-success)',
    },
  ];

  return (
    <section
      style={{
        padding: '5rem 1.5rem',
        backgroundColor: 'var(--color-surface-lighter)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.025em',
              marginBottom: '1rem',
            }}
          >
            Core Features
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
            OdysseusAI is equipped with comprehensive travel management features to streamline your next trip.
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
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card
                  hoverable={true}
                  style={{
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '0.75rem',
                      backgroundColor: feat.bgColor,
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feat.iconColor,
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {feat.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
