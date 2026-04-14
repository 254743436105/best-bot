const axios = require('axios');

module.exports = async (sock, msg, args, from) => {
  try {
    const res = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 });
    const [q] = res.data;

    await sock.sendMessage(from, {
      text: `💡 *Quote of the Moment*\n\n_"${q.q}"_\n\n— *${q.a}*`,
    });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Could not fetch a quote right now. Try again!' });
  }
};
