const axios = require('axios');
module.exports = async (sock, msg, args, jid) => {
  try {
    const res = await axios.get('https://catfact.ninja/fact', { timeout: 8000 });
    await sock.sendMessage(jid, { text: `🐱 *Cat Fact*\n\n${res.data.fact}` });
  } catch { await sock.sendMessage(jid, { text: '❌ Could not fetch cat fact.' }); }
};
