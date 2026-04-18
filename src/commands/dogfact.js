const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  try {
    const res = await axios.get('https://dogapi.dog/api/v2/facts', { timeout: 8000 });
    await sock.sendMessage(from, { text: `🐶 *Dog Fact*\n\n${res.data.data[0].attributes.body}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not fetch dog fact.' }); }
};
