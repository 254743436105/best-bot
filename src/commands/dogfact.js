const axios = require('axios');
module.exports = async (sock, msg, args, jid) => {
  try {
    const res = await axios.get('https://dogapi.dog/api/v2/facts', { timeout: 8000 });
    await sock.sendMessage(jid, { text: `🐶 *Dog Fact*\n\n${res.data.data[0].attributes.body}` });
  } catch { await sock.sendMessage(jid, { text: '❌ Could not fetch dog fact.' }); }
};
