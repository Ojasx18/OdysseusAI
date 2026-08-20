import { motion } from 'framer-motion';

function InterestStep({ watch, setValue, register }) {
  const selectedInterests = watch('interests') || [];

  const availableInterests = [
    { id: 'culture', label: 'Culture & Heritage' },
    { id: 'nature', label: 'Nature & Wildlife' },
    { id: 'adventure', label: 'Adventure & Sport' },
    { id: 'art', label: 'Art & Museums' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'romance', label: 'Romance & Honeymoon' },
    { id: 'shopping', label: 'Shopping & Malls' },
    { id: 'relaxation', label: 'Relaxation & Spa' },
    { id: 'nightlife', label: 'Nightlife & Pubs' },
    { id: 'history', label: 'History & Landmarks' },
  ];

  const handleInterestToggle = (id) => {
    let updated;
    if (selectedInterests.includes(id)) {
      updated = selectedInterests.filter((item) => item !== id);
    } else {
      updated = [...selectedInterests, id];
    }
    setValue('interests', updated, { shouldValidate: true });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        What are your interests?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Select one or more categories that align with your travel style. The itinerary activities will prioritize these.
      </p>

      {/* Hidden field for register */}
      <input type="hidden" {...register('interests')} />

      {/* Grid of tags */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          justifyContent: 'center',
          padding: '0.5rem 0',
        }}
      >
        {availableInterests.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);

          return (
            <motion.button
              key={interest.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleInterestToggle(interest.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.65rem 1.25rem',
                borderRadius: '9999px',
                border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.08)' : 'var(--color-surface-light)',
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: isSelected ? '0 2px 8px rgba(15, 118, 110, 0.05)' : '0 1px 2px rgba(0,0,0,0.01)',
              }}
            >
              {isSelected && (
                <svg
                  width="12px"
                  height="12px"
                  viewBox="0 0 18 18"
                  style={{
                    marginRight: '0.4rem',
                    stroke: 'var(--color-primary)',
                    strokeWidth: 3,
                    fill: 'none',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  }}
                >
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              )}
              {interest.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default InterestStep;
