const axios = require('axios');
module.exports = async (sock, msg, args, jid) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: `!wiki <topic>`\nExample: `!wiki Albert Einstein`' });
  const topic = args.join(' ');
  try {
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`, { timeout: 8000 });
    const d = res.data;
    if (d.type === 'disambiguation') return sock.sendMessage(jid, { text: `⚠️ *${topic}* is ambiguous. Try a more specific term.` });
    const summary = d.extract?.substring(0, 800) + (d.extract?.length > 800 ? '...' : '');
    await sock.sendMessage(jid, { text: `📚 *${d.title}*\n━━━━━━━━━━━━━━━\n${summary}\n━━━━━━━━━━━━━━━\n🔗 ${d.content_urls?.desktop?.page || ''}` });
  } catch { await sock.sendMessage(jid, { text: `❌ Wikipedia article not found: *${topic}*` }); }
};
