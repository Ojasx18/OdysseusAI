const config = require('../server/config');

console.log('[WEATHER DIRECT TEST]');
console.log('OPENWEATHER_API_KEY length:', config.openweatherApiKey ? config.openweatherApiKey.length : 0);
const isPlaceholder = config.openweatherApiKey === 'your_openweather_api_key_here';
console.log('Is placeholder:', isPlaceholder);

const testUrl = `https://api.openweathermap.org/data/2.5/weather?lat=15.2993&lon=74.1240&appid=${config.openweatherApiKey}&units=metric`;

fetch(testUrl)
  .then(async (res) => {
    console.log('Status code:', res.status);
    console.log('Status text:', res.statusText);
    const body = await res.json().catch(() => ({}));
    console.log('Response body:', JSON.stringify(body));
  })
  .catch((err) => {
    console.error('Fetch error:', err.message);
  });
