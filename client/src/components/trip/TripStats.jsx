import { Compass, Bookmark, Globe, CreditCard } from 'lucide-react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/currency';

function TripStats({ stats = {} }) {
  const {
    tripsPlanned = 0,
    savedPlaces = 0,
    destinations = 0,
    totalBudget = 0,
  } = stats;

  const statItems = [
    {
      label: 'Trips Planned',
      value: tripsPlanned,
      icon: Compass,
      color: 'var(--color-primary)',
      bg: 'rgba(15, 118, 110, 0.1)',
    },
    {
      label: 'Saved Places',
      value: savedPlaces,
      icon: Bookmark,
      color: 'var(--color-secondary)',
      bg: 'rgba(14, 165, 233, 0.1)',
    },
    {
      label: 'Destinations',
      value: destinations,
      icon: Globe,
      color: 'var(--color-accent)',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Total Budget',
      value: formatCurrency(totalBudget, 'INR'),
      icon: CreditCard,
      color: 'var(--color-success)',
      bg: 'rgba(22, 163, 74, 0.1)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            padding="sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '0.75rem',
                backgroundColor: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.15rem',
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                }}
              >
                {item.value}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default TripStats;
