import React from 'react';

function WeatherIcon({ code, size = 64, className = '', style = {} }) {
  if (!code) return null;
  
  // Use official OpenWeather 2x icon images
  const iconUrl = `https://openweathermap.org/img/wn/${code}@2x.png`;

  return (
    <img
      src={iconUrl}
      alt="Weather status icon"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        ...style
      }}
      className={className}
      onError={(e) => {
        // Fallback placeholder if icon fails to load
        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
      }}
    />
  );
}

export default WeatherIcon;
