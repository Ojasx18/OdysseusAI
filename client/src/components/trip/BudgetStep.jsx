import { IndianRupee, Percent, TrendingUp, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';

function BudgetStep({ setValue, watch, register, errors }) {
  const selectedTier = watch('budgetTier') || 'moderate';

  const tiers = [
    { value: 'budget', label: 'Budget', sub: 'Backpacker style, hostels, public transit, street food', icon: Percent, defaultVal: 20000 },
    { value: 'moderate', label: 'Moderate', sub: 'Comfortable hotels, balanced dining, taxi/metro mix', icon: TrendingUp, defaultVal: 50000 },
    { value: 'luxury', label: 'Luxury', sub: 'Premium resorts, fine dining, private tours, rental cars', icon: Sparkles, defaultVal: 150000 },
  ];

  const handleTierClick = (tier, defaultVal) => {
    setValue('budgetTier', tier, { shouldValidate: true });
    setValue('budget', defaultVal, { shouldValidate: true });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        What is your budget?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Configure your travel spending limit. The AI will align hotels, flight pricing, activities, and dining places with it.
      </p>

      {/* Grid Tiers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {tiers.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTier === t.value;

          return (
            <div key={t.value} onClick={() => handleTierClick(t.value, t.defaultVal)} style={{ cursor: 'pointer' }}>
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
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.15rem' }}>{t.label}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{t.sub}</p>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Hidden tier field registered */}
      <input type="hidden" {...register('budgetTier')} />

      {/* Custom Budget Estimate Input */}
      <Input
        label="Estimated Budget Limit (INR)"
        placeholder="e.g. 50000"
        type="number"
        icon={IndianRupee}
        error={errors.budget?.message}
        {...register('budget', {
          required: 'Budget is required',
          min: { value: 1, message: 'Budget must be greater than 0' },
        })}
      />
    </div>
  );
}

export default BudgetStep;
