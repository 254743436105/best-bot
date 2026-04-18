const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  const ip = args[0];
  if (!ip) return sock.sendMessage(from, { text: '⚠️ Usage: `!ip <address>`\nExample: `!ip 8.8.8.8`' });
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 8000 });
    const d = res.data;
    if (d.status !== 'success') return sock.sendMessage(from, { text: '❌ Invalid IP address.' });
    await sock.sendMessage(from, { text: `🌐 *IP Lookup: ${ip}*\n━━━━━━━━━━━━━━━\n🌍 Country: ${d.country}\n🏙️ City: ${d.city}\n📍 Region: ${d.regionName}\n🏢 ISP: ${d.isp}\n🕐 Timezone: ${d.timezone}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not look up IP.' }); }
};
