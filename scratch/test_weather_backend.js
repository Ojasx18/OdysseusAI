const weatherService = require('../server/services/weatherService');
const config = require('../server/config');

console.log('=== WEATHER BACKEND TEST ===');
console.log('OPENWEATHER_API_KEY Configured:', config.openweatherApiKey && config.openweatherApiKey !== 'your_openweather_api_key_here');

// Call weatherService with Goa coordinates
weatherService.getWeather(15.2993, 74.1240)
  .then((data) => {
    console.log('Success! Normalized weather data:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error('Error occurred in weatherService.getWeather:', err.message);
    if (err.statusCode) {
      console.error('HTTP Status Code:', err.statusCode);
    }
  });
