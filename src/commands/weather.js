const axios = require('axios');

const WMO_CODES = {
  0: '☀️ Clear sky', 1: '🌤️ Mainly clear', 2: '⛅ Partly cloudy', 3: '☁️ Overcast',
  45: '🌫️ Foggy', 48: '🌫️ Icy fog', 51: '🌦️ Light drizzle', 53: '🌧️ Drizzle',
  55: '🌧️ Heavy drizzle', 61: '🌧️ Slight rain', 63: '🌧️ Moderate rain',
  65: '🌧️ Heavy rain', 71: '🌨️ Slight snow', 73: '❄️ Moderate snow',
  75: '❄️ Heavy snow', 80: '🌦️ Rain showers', 81: '🌧️ Moderate showers',
  82: '⛈️ Violent showers', 95: '⛈️ Thunderstorm', 99: '⛈️ Thunderstorm with hail',
};

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, { text: '⚠️ Please provide a city.\nExample: `!weather Nairobi`' });
  }

  const city = args.join(' ');

  try {
    // Geocode the city
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' },
      timeout: 8000,
    });

    const results = geoRes.data?.results;
    if (!results || results.length === 0) {
      return sock.sendMessage(from, { text: `❌ Could not find city: *${city}*` });
    }

    const { latitude, longitude, name, country } = results[0];

    // Fetch weather
    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature',
        wind_speed_unit: 'kmh',
        timezone: 'auto',
      },
      timeout: 8000,
    });

    const c = weatherRes.data.current;
    const condition = WMO_CODES[c.weather_code] || '🌡️ Unknown';

    const text = `
🌍 *Weather in ${name}, ${country}*
━━━━━━━━━━━━━━━
${condition}
🌡️ Temp: *${c.temperature_2m}°C* (feels like ${c.apparent_temperature}°C)
💧 Humidity: *${c.relative_humidity_2m}%*
💨 Wind: *${c.wind_speed_10m} km/h*
━━━━━━━━━━━━━━━
_Data from Open-Meteo_
    `.trim();

    await sock.sendMessage(from, { text });
  } catch (err) {
    console.error('Weather error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to fetch weather. Please try again later.' });
  }
};
