import React from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import Button from '../common/Button';

function WeatherError({ onRetry, message = 'Weather information is temporarily unavailable.' }) {
  return (
    <div 
      className="p-8 rounded-2xl border text-center flex flex-col items-center justify-center max-w-md mx-auto"
      style={{
        backgroundColor: 'var(--color-surface-light)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)',
        animation: 'fadeIn 0.4s ease-out'
      }}
    >
      <div className="w-16 h-16 rounded-full bg-[rgba(220,38,38,0.05)] flex items-center justify-center mb-4 text-[var(--color-error)]">
        <CloudOff size={32} />
      </div>
      
      <h3 className="text-[var(--color-text)] font-bold text-lg mb-2">Weather Load Failed</h3>
      <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-xs leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="secondary"
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export default WeatherError;
