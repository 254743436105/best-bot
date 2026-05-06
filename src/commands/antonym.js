const axios = require('axios');
module.exports = async (sock, msg, args, jid) => {
  if (!args[0]) return sock.sendMessage(jid, { text: '⚠️ Usage: `!antonym <word>`\nExample: `!antonym happy`' });
  try {
    const res = await axios.get(`https://api.datamuse.com/words?rel_ant=${args[0]}&max=10`, { timeout: 8000 });
    if (!res.data.length) return sock.sendMessage(jid, { text: `❌ No antonyms found for *${args[0]}*` });
    const antonyms = res.data.map(w => w.word).join(', ');
    await sock.sendMessage(jid, { text: `📝 *Antonyms for "${args[0]}"*\n\n${antonyms}` });
  } catch { await sock.sendMessage(jid, { text: '❌ Could not fetch antonyms.' }); }
};
