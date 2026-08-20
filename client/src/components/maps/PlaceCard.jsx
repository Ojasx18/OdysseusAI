import { MapPin, Navigation, Plus } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

function PlaceCard({ place, onViewOnMap }) {
  if (!place) return null;

  const { name, category, address, latitude, longitude } = place;

  // Format category badge labels
  const getCategoryLabel = (cat) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      attractions: 'var(--color-primary-light)',
      restaurants: 'rgba(22, 163, 74, 0.08)',
      cafes: 'var(--color-secondary-light)',
      museums: 'rgba(219, 39, 119, 0.08)',
      beaches: 'var(--color-secondary-light)',
      parks: 'rgba(22, 163, 74, 0.08)',
      hotels: 'rgba(147, 51, 234, 0.08)',
      shopping: 'rgba(217, 119, 6, 0.08)',
      temples: 'rgba(234, 88, 12, 0.08)',
      viewpoints: 'var(--color-secondary-light)',
    };
    return colors[cat] || 'var(--color-primary-light)';
  };

  const getCategoryTextColor = (cat) => {
    const colors = {
      attractions: 'var(--color-primary)',
      restaurants: 'var(--color-success)',
      cafes: 'var(--color-secondary)',
      museums: '#db2777',
      beaches: 'var(--color-secondary)',
      parks: 'var(--color-success)',
      hotels: '#9333ea',
      shopping: 'var(--color-accent)',
      temples: '#ea580c',
      viewpoints: '#0891b2',
    };
    return colors[cat] || 'var(--color-primary)';
  };

  return (
    <Card
      padding="sm"
      style={{
        backgroundColor: 'var(--color-surface-light)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(23, 32, 51, 0.04)',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name}
        </h4>
        
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: '0.45rem',
            backgroundColor: getCategoryColor(category),
            color: getCategoryTextColor(category),
            flexShrink: 0,
          }}
        >
          {getCategoryLabel(category)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '1rem', lineHeight: 1.4 }}>
        <MapPin size={14} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
        <span>{address}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          onClick={() => onViewOnMap(latitude, longitude)}
          variant="outline"
          size="sm"
          icon={Navigation}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          View Map
        </Button>
        <Button
          disabled={true}
          variant="ghost"
          size="sm"
          icon={Plus}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            cursor: 'not-allowed',
            opacity: 0.5,
          }}
          title="Add itinerary editing functionality is coming soon"
        >
          Add to Trip (Soon)
        </Button>
      </div>
    </Card>
  );
}

export default PlaceCard;
