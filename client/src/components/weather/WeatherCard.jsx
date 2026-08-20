import React from 'react';
import { useQuery } from '@tanstack/react-query';
import weatherService from '../../services/weatherService';
import CurrentWeather from './CurrentWeather';
import WeatherForecast from './WeatherForecast';
import WeatherSkeleton from './WeatherSkeleton';
import WeatherError from './WeatherError';

function WeatherCard({ latitude, longitude, locationName }) {
  // Validate coordinates before querying
  const hasValidCoords = 
    latitude !== undefined && 
    longitude !== undefined && 
    !isNaN(parseFloat(latitude)) && 
    !isNaN(parseFloat(longitude)) && 
    parseFloat(latitude) >= -90 && 
    parseFloat(latitude) <= 90 && 
    parseFloat(longitude) >= -180 && 
    parseFloat(longitude) <= 180;

  if (!hasValidCoords) {
    return (
      <div 
        className="p-6 rounded-2xl border text-center text-[var(--color-text-muted)] text-sm leading-relaxed" 
        style={{ 
          backgroundColor: 'var(--color-surface-light)', 
          borderColor: 'var(--color-border)',
          boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        Weather information is unavailable because this trip does not have valid location coordinates.
      </div>
    );
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  // Fetch normalized weather payload via TanStack Query
  const { 
    data: responseBody, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['weather', latNum, lngNum],
    queryFn: async () => {
      const response = await weatherService.getWeather(latNum, lngNum);
      return response.data; // response is standard Express envelope { success: true, data: {...} }
    },
    staleTime: 10 * 60 * 1000, // Cache results for 10 minutes to avoid redundant API hits
    retry: 1, // Only retry once on failure to minimize rate limits
    enabled: hasValidCoords
  });

  if (isLoading) {
    return <WeatherSkeleton />;
  }

  if (isError) {
    // If backend returns a specific error message, propagate it, otherwise use default
    const errorMsg = error.response?.data?.message || 'Weather information is temporarily unavailable.';
    return <WeatherError onRetry={refetch} message={errorMsg} />;
  }

  const weatherData = responseBody;

  return (
    <div className="space-y-6 w-full">
      {/* Current weather overview */}
      <CurrentWeather 
        data={weatherData.current} 
        locationName={locationName} 
      />

      {/* 5-day daily forecast summary */}
      <WeatherForecast 
        forecastList={weatherData.forecast} 
      />
    </div>
  );
}

export default WeatherCard;
