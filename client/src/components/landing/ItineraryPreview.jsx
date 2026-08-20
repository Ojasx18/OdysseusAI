import { motion } from 'framer-motion';
import { Plane, Calendar, IndianRupee, Heart, MapPin, Clock } from 'lucide-react';
import Card from '../common/Card';

function ItineraryPreview() {
  const activities = [
    {
      time: '09:00 AM',
      title: 'Arrival & Beachside Check-In',
      description: 'Transfer from Ngurah Rai Airport to Seminyak Luxury Resort. Enjoy a welcome coconut drink.',
      location: 'Seminyak Beach',
    },
    {
      time: '01:00 PM',
      title: 'Lunch at Merah Putih Restaurant',
      description: 'Experience authentic traditional Indonesian cuisine styled inside an eco-designed indoor garden.',
      location: 'Seminyak Center',
    },
    {
      time: '03:30 PM',
      title: 'Uluwatu Cliff Temple Visit',
      description: 'Explore the ancient cliffside temple offering scenic panoramas of the Indian Ocean horizon.',
      location: 'Uluwatu Cliffs',
    },
    {
      time: '06:00 PM',
      title: 'Kecak Fire Dance Performance',
      description: 'Watch the traditional Balinese fire dance set against the sunset sky on the open cliff stage.',
      location: 'Uluwatu Amphitheatre',
    },
  ];

  return (
    <section
      style={{
        padding: '5rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
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
          AI Itinerary Preview
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
          Experience the granularity of itineraries OdysseusAI can generate for your travel configurations.
        </p>
      </div>

      {/* Preview Container Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Trip Configuration Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card
            title="Trip Configuration"
            subtitle="Parameters configured by the traveler"
            gradient={true}
            style={{ border: '1px solid var(--color-border)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              {/* Destination */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '0.5rem', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--color-secondary)' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Destination</p>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Bali, Indonesia</p>
                </div>
              </div>

              {/* Duration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '0.5rem', backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-primary)' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Duration</p>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>5 Days (Aug 20 - Aug 25)</p>
                </div>
              </div>

              {/* Budget */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent)' }}>
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Budget Category</p>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Moderate (₹50,000 INR)</p>
                </div>
              </div>

              {/* Style */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '0.5rem', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'var(--color-success)' }}>
                  <Heart size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Travel Style</p>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Relaxed, Culture & Cuisine</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right: Itinerary Day Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card
            title="Day 1 Itinerary"
            subtitle="AI curated schedule"
          >
            {/* Timeline Wrapper */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              {/* Vertical Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  bottom: '0.5rem',
                  left: '3px',
                  width: '2px',
                  background: 'linear-gradient(to bottom, var(--color-primary), var(--color-secondary))',
                  opacity: 0.3,
                }}
              />

              {activities.map((act) => (
                <div key={act.time} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 'calc(-1.25rem - 2px)',
                      top: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-light)',
                      border: '2px solid var(--color-primary)',
                    }}
                  />

                  {/* Activity Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Clock size={12} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                        {act.time}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {act.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      {act.description}
                    </p>
                    <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-lighter)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
                      <MapPin size={10} color="var(--color-primary)" />
                      {act.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default ItineraryPreview;
