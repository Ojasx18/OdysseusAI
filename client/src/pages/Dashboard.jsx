import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Calendar, Bookmark, Heart, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import TripStats from '../components/trip/TripStats';
import TripCard from '../components/trip/TripCard';
import api from '../services/api';

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

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch Trips
  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data.data.trips;
    },
  });

  // Calculate live statistics
  const tripsPlanned = trips.length;
  const savedPlaces = 0; // Bookmark logic fallback
  const uniqueDestinations = new Set(trips.map((t) => t.destination.toLowerCase())).size;
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);

  const stats = {
    tripsPlanned,
    savedPlaces,
    destinations: uniqueDestinations,
    totalBudget,
  };

  // Find upcoming trip (future start date or most recent fallback)
  const upcomingTrip = trips.find((t) => new Date(t.startDate) >= new Date()) || trips[0];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 0',
      }}
    >
      {/* Welcome Header + Plan Trip Button */}
      <motion.div
        variants={item}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            Welcome back, <span style={{ color: 'var(--color-primary)' }}>{user?.name || 'Traveler'}</span>!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.975rem' }}>
            Ready to chart your next travel destination?
          </p>
        </div>
        <Button
          variant="primary"
          icon={Compass}
          onClick={() => navigate('/plan')}
        >
          Plan New Trip
        </Button>
      </motion.div>

      {/* Statistics Section */}
      <motion.div variants={item}>
        <TripStats stats={stats} />
      </motion.div>

      {/* Main Dashboard Layout Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Recent Trips */}
        <motion.div
          variants={item}
          style={{
            gridColumn: 'span 2', // Spans larger screen width
          }}
          className="recent-trips-section"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>Recent Itineraries</h2>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <AlertCircle size={16} />
              <span>{error.message || 'Failed to retrieve trips. Please try again.'}</span>
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse border rounded-2xl"
                  style={{
                    height: '240px',
                    backgroundColor: 'var(--color-surface-light)',
                    borderColor: 'var(--color-border)',
                  }}
                />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <Card style={{ padding: '3rem 1.5rem' }}>
              <EmptyState
                title="No trips yet."
                description="Your upcoming and past travel plans will show up here. Let's start curating your first itinerary!"
                icon={Compass}
                action={
                  <Button variant="primary" onClick={() => navigate('/plan')}>
                    Plan Your First Adventure
                  </Button>
                }
              />
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {trips.slice(0, 6).map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onClick={() => navigate(`/trips/${trip._id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column: Upcoming Trip & Saved Places */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Upcoming Trip Card */}
          <motion.div variants={item}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Upcoming Journey</h2>
            {isLoading ? (
              <Card>
                <div className="animate-pulse space-y-3 py-2">
                  <div className="h-5 w-24 bg-slate-200/50 rounded"></div>
                  <div className="h-4 w-36 bg-slate-200/30 rounded"></div>
                  <div className="h-4 w-28 bg-slate-200/30 rounded"></div>
                </div>
              </Card>
            ) : upcomingTrip ? (
              <Card>
                <div 
                  onClick={() => navigate(`/trips/${upcomingTrip._id}`)}
                  style={{ cursor: 'pointer', textAlign: 'left' }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                    {upcomingTrip.destination}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {new Date(upcomingTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(upcomingTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      {upcomingTrip.travelers} {upcomingTrip.travelers > 1 ? 'Travelers' : 'Traveler'}
                    </span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                      {upcomingTrip.currency === 'USD' ? '$' : '₹'}{upcomingTrip.budget}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(15, 118, 110, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                    <Calendar size={18} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>No upcoming trips</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '240px', lineHeight: 1.4 }}>
                    Schedule your next getaway to view countdown details here.
                  </p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Saved Places Section */}
          <motion.div variants={item}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Saved Locations</h2>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(14, 165, 233, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)', marginBottom: '0.75rem' }}>
                  <Heart size={18} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>No saved places</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '240px', lineHeight: 1.4 }}>
                  Bookmark interesting spots during itinerary planning.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
