import { MapPin, Calendar, Users, IndianRupee, Heart, Utensils, Hotel, Car } from 'lucide-react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/currency';

function ReviewStep({ watch }) {
  const data = watch();

  const getDaysCount = () => {
    if (!data.startDate || !data.endDate) return 0;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diff = end - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
    textAlign: 'left',
    marginTop: '1rem',
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const iconWrapper = (color, bg) => ({
    width: '36px',
    height: '36px',
    borderRadius: '0.5rem',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        Review your trip criteria
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Confirm your preferences. Our AI will use these variables to customize your day-by-day itinerary.
      </p>

      <Card>
        <div style={gridStyle}>
          {/* Destination */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-secondary)', 'rgba(14, 165, 233, 0.1)')}>
              <MapPin size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Destination</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{data.destination || 'Not Specified'}</p>
            </div>
          </div>

          {/* Dates */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-primary)', 'rgba(15, 118, 110, 0.1)')}>
              <Calendar size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Dates & Duration</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {formatDate(data.startDate)} - {formatDate(data.endDate)} ({getDaysCount()} Days)
              </p>
            </div>
          </div>

          {/* Travelers */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-accent)', 'rgba(245, 158, 11, 0.1)')}>
              <Users size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Travelers</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {data.travelers || 1} {data.travelers > 1 ? 'People' : 'Person'}
              </p>
            </div>
          </div>

          {/* Budget */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-success)', 'rgba(22, 163, 74, 0.1)')}>
              <IndianRupee size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Budget Estimate</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {formatCurrency(data.budget, data.currency || 'INR')} {String(data.currency || 'INR').toUpperCase()} ({data.budgetTier ? data.budgetTier.toUpperCase() : 'MODERATE'})
              </p>
            </div>
          </div>

          {/* Style */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-primary)', 'rgba(15, 118, 110, 0.1)')}>
              <Heart size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Travel Style</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {data.travelStyle ? data.travelStyle.toUpperCase() : 'BALANCED'}
              </p>
            </div>
          </div>

          {/* Accommodation */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-secondary)', 'rgba(14, 165, 233, 0.1)')}>
              <Hotel size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Accommodation</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {data.accommodation || 'Hotel'}
              </p>
            </div>
          </div>

          {/* Food */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-success)', 'rgba(22, 163, 74, 0.1)')}>
              <Utensils size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Food Diet</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {data.foodPreferences || 'Local'}
              </p>
            </div>
          </div>

          {/* Transport */}
          <div style={itemStyle}>
            <div style={iconWrapper('var(--color-accent)', 'rgba(245, 158, 11, 0.1)')}>
              <Car size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Preferred Transit</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {data.transportation || 'Metro'}
              </p>
            </div>
          </div>
        </div>

        {/* Interests Badges */}
        {data.interests && data.interests.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.50rem' }}>Interests & Focus</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.interests.map((interest) => (
                <span
                  key={interest}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(15, 118, 110, 0.08)',
                    border: '1px solid rgba(15, 118, 110, 0.15)',
                    color: 'var(--color-primary)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  {interest.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ReviewStep;
