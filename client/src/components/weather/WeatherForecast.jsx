import React from 'react';
import WeatherIcon from './WeatherIcon';

function WeatherForecast({ forecastList }) {
  if (!forecastList || forecastList.length === 0) return null;

  // Format YYYY-MM-DD date string to Today, Tomorrow, or Weekday Name
  const formatDayLabel = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const targetTime = dateObj.getTime();

    if (targetTime === today.getTime()) {
      return 'Today';
    } else if (targetTime === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Format date for secondary label (e.g. "Aug 17")
  const formatDateLabel = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h3 className="text-[var(--color-text)] font-extrabold text-base tracking-tight text-left">
        5-Day Weather Forecast
      </h3>
      
      {/* Horizontally scrollable list on mobile, grid layout on larger viewports */}
      <div 
        className="flex md:grid overflow-x-auto md:overflow-x-visible md:grid-cols-6 gap-3 pb-3 md:pb-0 scrollbar-none snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {forecastList.slice(0, 6).map((dayData, idx) => {
          const dayLabel = formatDayLabel(dayData.date);
          const dateLabel = formatDateLabel(dayData.date);
          
          return (
            <div 
              key={dayData.date}
              className="p-4 rounded-xl border flex flex-col items-center justify-between text-center min-w-[120px] md:min-w-0 flex-shrink-0 snap-align-start transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-surface-light)',
                borderColor: 'var(--color-border)',
                boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)'
              }}
            >
              {/* Day title & Date info */}
              <div className="space-y-0.5">
                <p className="text-[var(--color-text)] font-bold text-sm tracking-tight truncate max-w-[100px]">
                  {dayLabel}
                </p>
                <p className="text-[var(--color-text-muted)] text-[10px] font-medium uppercase tracking-wider">
                  {dateLabel}
                </p>
              </div>

              {/* Icon */}
              <WeatherIcon code={dayData.icon} size={48} className="my-1.5" />

              {/* Temperature metrics */}
              <div className="space-y-1">
                <p className="text-[var(--color-text)] font-extrabold text-base">
                  {dayData.temperature}°
                </p>
                <div className="flex items-center gap-1.5 justify-center text-[10px] font-semibold">
                  <span className="text-[var(--color-secondary)]">{dayData.minTemp}°</span>
                  <span className="text-[var(--color-border)]">|</span>
                  <span className="text-[var(--color-error)]">{dayData.maxTemp}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherForecast;
