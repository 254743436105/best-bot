const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage: `!antonym <word>`\nExample: `!antonym happy`' });
  try {
    const res = await axios.get(`https://api.datamuse.com/words?rel_ant=${args[0]}&max=10`, { timeout: 8000 });
    if (!res.data.length) return sock.sendMessage(from, { text: `❌ No antonyms found for *${args[0]}*` });
    const antonyms = res.data.map(w => w.word).join(', ');
    await sock.sendMessage(from, { text: `📝 *Antonyms for "${args[0]}"*\n\n${antonyms}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not fetch antonyms.' }); }
};
