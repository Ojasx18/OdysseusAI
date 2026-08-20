import { User, Users, Home, ShieldAlert } from 'lucide-react';
import Card from '../common/Card';

function TravelerStep({ setValue, watch, register, errors }) {
  const travelersCount = watch('travelers') || 1;

  const options = [
    { label: 'Solo', sub: 'Single adventurer', count: 1, icon: User },
    { label: 'Couple', sub: 'Two travelers', count: 2, icon: Users },
    { label: 'Family', sub: '3 to 5 travelers', count: 4, icon: Home },
    { label: 'Group', sub: '6+ travelers', count: 8, icon: ShieldAlert },
  ];

  const handleOptionClick = (count) => {
    setValue('travelers', count, { shouldValidate: true });
  };

  const handleIncrement = () => {
    setValue('travelers', Number(travelersCount) + 1, { shouldValidate: true });
  };

  const handleDecrement = () => {
    if (travelersCount > 1) {
      setValue('travelers', Number(travelersCount) - 1, { shouldValidate: true });
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        Who is traveling?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Select your travel party. This changes the pacing, accommodation recommendations, and pricing breakdowns.
      </p>

      {/* Grid options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = travelersCount === opt.count ||
            (opt.label === 'Family' && travelersCount >= 3 && travelersCount <= 5) ||
            (opt.label === 'Group' && travelersCount >= 6);

          return (
            <div key={opt.label} onClick={() => handleOptionClick(opt.count)} style={{ cursor: 'pointer' }}>
              <Card
                padding="sm"
                style={{
                  height: '100%',
                  textAlign: 'center',
                  backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.08)' : 'var(--color-surface-light)',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  <Icon size={24} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.15rem' }}>{opt.label}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{opt.sub}</p>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Manual Counter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Traveler Count
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            type="button"
            onClick={handleDecrement}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-light)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            -
          </button>
          
          {/* Registered hidden/visible input */}
          <input
            type="number"
            {...register('travelers', {
              required: 'Traveler count is required',
              min: { value: 1, message: 'Must be at least 1 traveler' },
            })}
            style={{
              width: '60px',
              textAlign: 'center',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              background: 'none',
              border: 'none',
              outline: 'none',
            }}
            readOnly
          />

          <button
            type="button"
            onClick={handleIncrement}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-light)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            +
          </button>
        </div>
        {errors.travelers && (
          <p style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>{errors.travelers.message}</p>
        )}
      </div>
    </div>
  );
}

export default TravelerStep;
