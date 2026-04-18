const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  const now = new Date();
  const month = now.getMonth() + 1, day = now.getDate();
  try {
    const res = await axios.get(`https://history.muffinlabs.com/date/${month}/${day}`, { timeout: 8000 });
    const events = res.data.data.Events.slice(0, 5);
    const text = events.map(e => `📅 *${e.year}:* ${e.text}`).join('\n\n');
    await sock.sendMessage(from, { text: `📖 *This Day in History (${day}/${month})*\n━━━━━━━━━━━━━━━\n${text}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not fetch history.' }); }
};
