const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !weather <city>' });
  }

  const city = args.join(' ');
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return sock.sendMessage(jid, { text: '⚠️ WEATHER_API_KEY is not set in environment variables.' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const data = await fetchJSON(url);

    if (data.cod !== 200) {
      return sock.sendMessage(jid, { text: `❌ City not found: *${city}*` });
    }

    const { name, sys, main, weather, wind } = data;
    const text = `
🌍 *Weather in ${name}, ${sys.country}*

🌤 ${weather[0].description}
🌡 Temp: *${main.temp}°C* (feels like ${main.feels_like}°C)
💧 Humidity: *${main.humidity}%*
💨 Wind: *${wind.speed} m/s*
🔼 High: ${main.temp_max}°C  🔽 Low: ${main.temp_min}°C
    `.trim();

    await sock.sendMessage(jid, { text });
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Failed to fetch weather: ${e.message}` });
  }
}

module.exports = { execute };
