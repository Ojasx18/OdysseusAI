import { Calendar } from 'lucide-react';
import Input from '../common/Input';

function DateStep({ register, errors, watch }) {
  const startDate = watch('startDate');

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        When are you traveling?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Specify your start and end dates to align our AI with local seasonal weather and forecasts.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <Input
          label="Start Date"
          type="date"
          icon={Calendar}
          error={errors.startDate?.message}
          {...register('startDate', {
            required: 'Start date is required',
          })}
        />
        <Input
          label="End Date"
          type="date"
          icon={Calendar}
          error={errors.endDate?.message}
          {...register('endDate', {
            required: 'End date is required',
            validate: (value) => {
              if (!startDate) return true;
              return new Date(value) >= new Date(startDate) || 'End date cannot be before start date';
            },
          })}
        />
      </div>
    </div>
  );
}

export default DateStep;
