const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!country <name>`\nExample: `!country Kenya`' });
  const name = args.join(' ');
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`, { timeout: 8000 });
    const c = res.data[0];
    const currencies = Object.values(c.currencies || {}).map(cur => `${cur.name} (${cur.symbol})`).join(', ');
    const languages = Object.values(c.languages || {}).join(', ');
    await sock.sendMessage(from, { text: `🌍 *${c.name.common}*\n━━━━━━━━━━━━━━━\n🏙️ Capital: ${c.capital?.[0] || 'N/A'}\n🌐 Region: ${c.region} - ${c.subregion}\n👥 Population: ${c.population.toLocaleString()}\n💰 Currency: ${currencies}\n🗣️ Language: ${languages}\n📐 Area: ${c.area.toLocaleString()} km²\n🚗 Driving: ${c.car?.side || 'N/A'} side` });
  } catch { await sock.sendMessage(from, { text: `❌ Country not found: *${name}*` }); }
};
