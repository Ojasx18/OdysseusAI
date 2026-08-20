const weatherService = require('../services/weatherService');
const logger = require('../utils/logger');

/**
 * Controller to fetch normalized weather for a latitude and longitude
 */
const getWeather = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    logger.info(`[WEATHER REQUEST]\nlatitude: ${latitude}\nlongitude: ${longitude}`);

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Both latitude and longitude query parameters are required',
      });
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers',
      });
    }

    if (latNum < -90 || latNum > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90 degrees',
      });
    }

    if (lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180 degrees',
      });
    }

    const weatherData = await weatherService.getWeather(latNum, lngNum);

    return res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    
    // Structured console logging for development diagnostics
    logger.error(`[OPENWEATHER ERROR]\nstatus: ${statusCode}\nmessage: ${error.message}`);
    
    const message = error.statusCode === 503 
      ? 'Weather service is temporarily unavailable' 
      : 'Failed to retrieve weather information';

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

module.exports = {
  getWeather,
};
