const axios = require('axios');
module.exports = async (sock, msg, args, jid) => {
  try {
    const res = await axios.get('https://api.adviceslip.com/advice', { timeout: 8000 });
    await sock.sendMessage(jid, { text: `💭 *Random Advice*\n\n_"${res.data.slip.advice}"_` });
  } catch { await sock.sendMessage(jid, { text: '❌ Could not fetch advice. Try again later.' }); }
};
