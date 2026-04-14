const axios = require('axios');
const cron = require('node-cron');

let bioJob = null;
let bioEnabled = false;
let bioInterval = '2h';

async function fetchQuote() {
  try {
    const res = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 });
    const [q] = res.data;
    return `"${q.q}" — ${q.a}`;
  } catch { return null; }
}

async function updateBio(sock) {
  const quote = await fetchQuote();
  if (!quote) return;
  try {
    const bio = quote.length > 139 ? quote.substring(0, 136) + '...' : quote;
    await sock.updateProfileStatus(bio);
    console.log(`📝 Bio updated`);
  } catch (err) { console.error('Bio update error:', err.message); }
}

function startAutoBio(sock, interval) {
  if (bioJob) bioJob.stop();
  bioInterval = interval || '2h';
  const expressions = {
    '30s': '*/30 * * * * *',
    '1m':  '* * * * *',
    '5m':  '*/5 * * * *',
    '30m': '*/30 * * * *',
    '1h':  '0 * * * *',
    '2h':  '0 */2 * * *',
  };
  const expr = expressions[bioInterval] || '0 */2 * * *';
  bioJob = cron.schedule(expr, () => updateBio(sock), { scheduled: true });
  bioEnabled = true;
  updateBio(sock);
}

function stopAutoBio() {
  if (bioJob) { bioJob.stop(); bioJob = null; }
  bioEnabled = false;
}

module.exports = async (sock, msg, args, from) => {
  const sub = (args[0] || '').toLowerCase();

  if (sub === 'on') {
    const interval = args[1] || '2h';
    const valid = ['30s', '1m', '5m', '30m', '1h', '2h'];
    if (!valid.includes(interval)) {
      return sock.sendMessage(from, { text: `❌ Invalid interval. Use: ${valid.join(', ')}\nExample: \`!autobio on 30s\`` });
    }
    startAutoBio(sock, interval);
    return sock.sendMessage(from, { text: `✅ *Auto Bio ON!*\nBio updates every *${interval}* with a new quote 💡` });
  }

  if (sub === 'off') {
    stopAutoBio();
    return sock.sendMessage(from, { text: '🚫 *Auto Bio disabled.*' });
  }

  if (sub === 'now') {
    await updateBio(sock);
    return sock.sendMessage(from, { text: '✅ Bio updated with a fresh quote!' });
  }

  await sock.sendMessage(from, {
    text: `📝 *Auto Bio*\nStatus: *${bioEnabled ? `ON ✅ (every ${bioInterval})` : 'OFF ❌'}*\n\nCommands:\n• \`!autobio on 30s\` — Every 30 seconds\n• \`!autobio on 1m\` — Every minute\n• \`!autobio on 5m\` — Every 5 minutes\n• \`!autobio on 30m\` — Every 30 minutes\n• \`!autobio on 1h\` — Every hour\n• \`!autobio on 2h\` — Every 2 hours\n• \`!autobio off\` — Disable\n• \`!autobio now\` — Update immediately`,
  });
};

module.exports.startAutoBio = startAutoBio;
module.exports.stopAutoBio = stopAutoBio;
