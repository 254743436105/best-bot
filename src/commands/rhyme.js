const axios = require('axios');
module.exports = async (sock, msg, args, jid) => {
  if (!args[0]) return sock.sendMessage(jid, { text: '⚠️ Usage: `!rhyme <word>`\nExample: `!rhyme love`' });
  try {
    const res = await axios.get(`https://api.datamuse.com/words?rel_rhy=${args[0]}&max=10`, { timeout: 8000 });
    if (!res.data.length) return sock.sendMessage(jid, { text: `❌ No rhymes found for *${args[0]}*` });
    const rhymes = res.data.map(w => w.word).join(', ');
    await sock.sendMessage(jid, { text: `🎵 *Rhymes for "${args[0]}"*\n\n${rhymes}` });
  } catch { await sock.sendMessage(jid, { text: '❌ Could not fetch rhymes.' }); }
};
