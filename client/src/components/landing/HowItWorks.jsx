import { motion } from 'framer-motion';
import { Map, Settings, Compass, MapPin } from 'lucide-react';
import Card from '../common/Card';

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Enter Details',
      description: 'Choose your destination, travel dates, and budget preference.',
      icon: MapPin,
      bgColor: 'var(--color-primary-light)',
      iconColor: 'var(--color-primary)',
    },
    {
      number: '02',
      title: 'Select Interests',
      description: 'Specify your travel style, activities, and dining preferences.',
      icon: Settings,
      bgColor: 'var(--color-secondary-light)',
      iconColor: 'var(--color-secondary)',
    },
    {
      number: '03',
      title: 'Generate Itinerary',
      description: 'Our AI curates a customized day-by-day itinerary in seconds.',
      icon: Compass,
      bgColor: 'rgba(245, 158, 11, 0.15)',
      iconColor: 'var(--color-accent)',
    },
    {
      number: '04',
      title: 'Map & Travel',
      description: 'Open the interactive map with route lines and offline support.',
      icon: Map,
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
            How It Works
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
            Plan your next dream trip in four simple, automated steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            position: 'relative',
          }}
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{ position: 'relative' }}
              >
                {/* Step Card */}
                <Card
                  style={{
                    height: '100%',
                    position: 'relative',
                    paddingTop: '2.5rem',
                  }}
                >
                  {/* Floating Step Number */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1.5rem',
                      fontSize: '3rem',
                      fontWeight: 900,
                      color: 'var(--color-primary)',
                      opacity: 0.15,
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.75rem',
                      backgroundColor: step.bgColor,
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.iconColor,
                      marginBottom: '1.5rem',
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {step.description}
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

export default HowItWorks;
