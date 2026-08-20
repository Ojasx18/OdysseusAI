import React from 'react';

function WeatherSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Current Weather Card Skeleton */}
      <div 
        className="p-6 rounded-2xl border" 
        style={{
          backgroundColor: 'var(--color-surface-light)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            {/* City Title */}
            <div className="h-7 w-36 bg-slate-200/50 rounded-lg"></div>
            {/* Condition Description */}
            <div className="h-4 w-24 bg-slate-200/30 rounded-lg"></div>
            {/* Temperature Big */}
            <div className="h-16 w-28 bg-slate-200/60 rounded-xl mt-2"></div>
            {/* Feels Like */}
            <div className="h-4 w-32 bg-slate-200/30 rounded-lg"></div>
          </div>
          
          {/* Side stats */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto md:min-w-[200px]">
            <div className="p-3 bg-[var(--color-surface-lighter)] rounded-xl space-y-2 border border-[var(--color-border)]">
              <div className="h-3 w-16 bg-slate-200/30 rounded"></div>
              <div className="h-6 w-12 bg-slate-200/50 rounded"></div>
            </div>
            <div className="p-3 bg-[var(--color-surface-lighter)] rounded-xl space-y-2 border border-[var(--color-border)]">
              <div className="h-3 w-16 bg-slate-200/30 rounded"></div>
              <div className="h-6 w-12 bg-slate-200/50 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Header */}
      <div className="h-5 w-40 bg-slate-200/40 rounded-lg mt-8"></div>

      {/* Forecast Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[...Array(6)].map((_, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-xl border flex flex-col items-center space-y-3 text-center"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderColor: 'var(--color-border)'
            }}
          >
            {/* Day name */}
            <div className="h-3.5 w-16 bg-slate-200/30 rounded"></div>
            {/* Icon circle */}
            <div className="h-12 w-12 bg-slate-200/40 rounded-full"></div>
            {/* Temp value */}
            <div className="h-5 w-10 bg-slate-200/50 rounded"></div>
            {/* Range */}
            <div className="h-3 w-14 bg-slate-200/20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherSkeleton;
