const config = require('../config');
const logger = require('../utils/logger');

/**
 * Normalizes OpenWeather 5-day/3-hour forecast into a clean 5-day daily forecast
 */
const normalizeForecast = (forecastList) => {
  const dailyForecasts = {};

  forecastList.forEach((item) => {
    const dateStr = item.dt_txt.split(' ')[0]; // Extract YYYY-MM-DD
    
    if (!dailyForecasts[dateStr]) {
      dailyForecasts[dateStr] = {
        date: dateStr,
        tempSum: 0,
        tempCount: 0,
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        conditions: [],
        middayItem: null,
      };
    }

    const day = dailyForecasts[dateStr];
    day.tempSum += item.main.temp;
    day.tempCount += 1;
    
    if (item.main.temp_min < day.minTemp) day.minTemp = item.main.temp_min;
    if (item.main.temp_max > day.maxTemp) day.maxTemp = item.main.temp_max;

    day.conditions.push({
      condition: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    });

    // Choose 12:00 PM as the representative interval for the day, or fallback to first interval
    if (item.dt_txt.includes('12:00:00') || !day.middayItem) {
      day.middayItem = item;
    }
  });

  return Object.values(dailyForecasts).map((day) => {
    const representative = day.middayItem || day.conditions[0];
    return {
      date: day.date,
      temperature: Math.round(day.tempSum / day.tempCount),
      minTemp: Math.round(day.minTemp),
      maxTemp: Math.round(day.maxTemp),
      condition: representative.weather ? representative.weather[0].main : representative.condition,
      description: representative.weather ? representative.weather[0].description : representative.description,
      icon: representative.weather ? representative.weather[0].icon : representative.icon,
    };
  });
};

/**
 * Fetches current weather and forecast for given lat/lng
 */
const getWeather = async (latitude, longitude) => {
  const apiKey = config.openweatherApiKey;

  if (!apiKey || apiKey === 'your_openweather_api_key_here') {
    logger.warn('OpenWeather API Key is missing or holds placeholder value. Reverting to error.');
    const error = new Error('OpenWeather API Key is not configured');
    error.statusCode = 503;
    throw error;
  }

  const numericLat = parseFloat(latitude);
  const numericLng = parseFloat(longitude);

  if (isNaN(numericLat) || isNaN(numericLng)) {
    throw new Error('Valid numeric coordinates are required');
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${numericLat}&lon=${numericLng}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${numericLat}&lon=${numericLng}&appid=${apiKey}&units=metric`;

  logger.info(`Requesting OpenWeather data for [${numericLat}, ${numericLng}]`);

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) {
      const errBody = await currentRes.json().catch(() => ({}));
      const errMsg = errBody.message || `OpenWeather API failed: ${currentRes.status} ${currentRes.statusText}`;
      logger.error(`[OPENWEATHER ERROR]\nstatus: ${currentRes.status}\nmessage: ${errMsg}`);
      const err = new Error(errMsg);
      err.statusCode = currentRes.status;
      throw err;
    }

    if (!forecastRes.ok) {
      const errBody = await forecastRes.json().catch(() => ({}));
      const errMsg = errBody.message || `OpenWeather API failed: ${forecastRes.status} ${forecastRes.statusText}`;
      logger.error(`[OPENWEATHER ERROR]\nstatus: ${forecastRes.status}\nmessage: ${errMsg}`);
      const err = new Error(errMsg);
      err.statusCode = forecastRes.status;
      throw err;
    }

    logger.info(`[OPENWEATHER RESPONSE]\nstatus: ${currentRes.status}`);

    const [currentData, forecastData] = await Promise.all([
      currentRes.json(),
      forecastRes.json()
    ]);

    // Normalize Wind Speed to km/h (OpenWeather metric is m/s. m/s * 3.6 = km/h)
    const windSpeedKmH = Math.round(currentData.wind.speed * 3.6);

    const normalizedData = {
      location: {
        latitude: numericLat,
        longitude: numericLng
      },
      current: {
        temperature: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: windSpeedKmH,
        icon: currentData.weather[0].icon,
      },
      forecast: normalizeForecast(forecastData.list || [])
    };

    return normalizedData;
  } catch (error) {
    logger.error(`OpenWeather fetch crash: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getWeather,
};
