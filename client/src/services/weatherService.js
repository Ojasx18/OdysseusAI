import axios from 'axios';

// Base backend API URL
const WEATHER_API_BASE = 'http://localhost:5000/api/weather';

const weatherService = {
  /**
   * Fetch weather forecast and current weather for given coordinates
   * @param {number} latitude - Location latitude
   * @param {number} longitude - Location longitude
   * @returns {Promise<Object>} API response body containing current and forecast weather
   */
  getWeather: async (latitude, longitude) => {
    const res = await axios.get(WEATHER_API_BASE, {
      params: {
        latitude,
        longitude,
      },
    });
    return res.data;
  },
};

export default weatherService;
