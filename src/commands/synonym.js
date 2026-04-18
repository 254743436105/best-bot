const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage: `!synonym <word>`\nExample: `!synonym happy`' });
  try {
    const res = await axios.get(`https://api.datamuse.com/words?rel_syn=${args[0]}&max=10`, { timeout: 8000 });
    if (!res.data.length) return sock.sendMessage(from, { text: `❌ No synonyms found for *${args[0]}*` });
    const synonyms = res.data.map(w => w.word).join(', ');
    await sock.sendMessage(from, { text: `📝 *Synonyms for "${args[0]}"*\n\n${synonyms}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not fetch synonyms.' }); }
};
