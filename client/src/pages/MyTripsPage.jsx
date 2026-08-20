import { useNavigate } from 'react-router-dom';
import { Plane, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import TripCard from '../components/trip/TripCard';
import api from '../services/api';

function MyTripsPage() {
  const navigate = useNavigate();

  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data.data.trips;
    },
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '2rem', textAlign: 'left' }}>
          My Itineraries
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, idx) => (
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
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          My Itineraries
        </h1>
        {trips.length > 0 && (
          <Button variant="primary" icon={Plane} onClick={() => navigate('/plan')}>
            Plan New Trip
          </Button>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <AlertCircle size={16} />
          <span>{error.message || 'Failed to retrieve trips. Please try again.'}</span>
        </div>
      )}

      {trips.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <EmptyState
            title="No planned trips"
            description="Your travel history and upcoming itineraries will show up here. Plan your first trip to get started!"
            icon={Plane}
            action={
              <Button variant="primary" onClick={() => navigate('/plan')}>
                Plan a Journey
              </Button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {trips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              onClick={() => navigate(`/trips/${trip._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTripsPage;
