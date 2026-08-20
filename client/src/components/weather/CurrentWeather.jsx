import React from 'react';
import { Thermometer, Droplets, Wind, MapPin } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

function CurrentWeather({ data, locationName }) {
  if (!data) return null;

  const {
    temperature,
    feelsLike,
    condition,
    description,
    humidity,
    windSpeed,
    icon,
  } = data;

  const capitalizedDesc = description 
    ? description.charAt(0).toUpperCase() + description.slice(1) 
    : condition;

  return (
    <div 
      className="p-6 md:p-8 rounded-2xl border relative overflow-hidden" 
      style={{
        backgroundColor: 'var(--color-surface-light)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)',
        animation: 'fadeIn 0.4s ease-out'
      }}
    >
      {/* Decorative ambient background gradient */}
      <div 
        className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'rgba(15, 118, 110, 0.05)'
        }}
      ></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* Main Weather Metric Info */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm tracking-wider uppercase">
            <MapPin size={16} />
            <span>{locationName || 'Current Destination'}</span>
          </div>

          <div className="flex items-center gap-4">
            <WeatherIcon code={icon} size={80} style={{ marginLeft: '-10px' }} />
            <div>
              <div className="text-5xl md:text-6xl font-black text-[var(--color-text)] flex items-start">
                {temperature}<span className="text-3xl md:text-4xl text-[var(--color-primary)] font-light mt-1">°C</span>
              </div>
              <p className="text-[var(--color-text-muted)] font-medium text-base mt-1">
                {capitalizedDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-sm">
            <Thermometer size={16} className="text-[var(--color-text-muted)]" />
            <span>Feels like <strong className="text-[var(--color-text)] font-semibold">{feelsLike}°C</strong></span>
          </div>
        </div>

        {/* Detailed Weather Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[280px]">
          {/* Humidity Stat */}
          <div 
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--color-surface-lighter)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
              <Droplets size={16} color="var(--color-secondary)" />
            </div>
            <div className="text-[var(--color-text)] font-extrabold text-xl text-left">
              {humidity}<span className="text-[var(--color-text-muted)] font-normal text-sm ml-0.5">%</span>
            </div>
          </div>

          {/* Wind Speed Stat */}
          <div 
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--color-surface-lighter)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Wind</span>
              <Wind size={16} color="var(--color-primary)" />
            </div>
            <div className="text-[var(--color-text)] font-extrabold text-xl text-left">
              {windSpeed}<span className="text-[var(--color-text-muted)] font-normal text-sm ml-0.5"> km/h</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CurrentWeather;
