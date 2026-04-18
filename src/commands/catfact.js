const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  try {
    const res = await axios.get('https://catfact.ninja/fact', { timeout: 8000 });
    await sock.sendMessage(from, { text: `🐱 *Cat Fact*\n\n${res.data.fact}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not fetch cat fact.' }); }
};
