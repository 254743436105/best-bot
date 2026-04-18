const axios = require('axios');

const WMO_CODES = {
  0: '☀️ Clear', 1: '🌤️ Mainly clear', 2: '⛅ Partly cloudy', 3: '☁️ Overcast',
  45: '🌫️ Foggy', 51: '🌦️ Light drizzle', 61: '🌧️ Rain', 63: '🌧️ Moderate rain',
  65: '🌧️ Heavy rain', 71: '🌨️ Snow', 80: '🌦️ Showers', 95: '⛈️ Thunderstorm',
};

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, { text: '⚠️ Usage: `!forecast <city>`\nExample: `!forecast Nairobi`' });
  }

  const city = args.join(' ');

  try {
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' },
      timeout: 8000,
    });

    const results = geoRes.data?.results;
    if (!results?.length) return sock.sendMessage(from, { text: `❌ City not found: *${city}*` });

    const { latitude, longitude, name, country } = results[0];

    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude, longitude,
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
        timezone: 'auto',
        forecast_days: 5,
      },
      timeout: 8000,
    });

    const d = weatherRes.data.daily;
    const days = d.time.map((date, i) => {
      const condition = WMO_CODES[d.weather_code[i]] || '🌡️';
      const day = new Date(date).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
      return `📅 *${day}*\n   ${condition}\n   🌡️ ${d.temperature_2m_min[i]}°C - ${d.temperature_2m_max[i]}°C\n   💧 Rain: ${d.precipitation_sum[i]}mm`;
    });

    await sock.sendMessage(from, {
      text: `🌍 *5-Day Forecast: ${name}, ${country}*\n━━━━━━━━━━━━━━━\n${days.join('\n\n')}\n━━━━━━━━━━━━━━━\n_Data from Open-Meteo_`,
    });
  } catch (err) {
    console.error('Forecast error:', err.message);
    await sock.sendMessage(from, { text: '❌ Could not fetch forecast. Try again later.' });
  }
};
