const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  const num = args[0] || Math.floor(Math.random() * 1000);
  try {
    const res = await axios.get(`http://numbersapi.com/${num}?json`, { timeout: 8000 });
    await sock.sendMessage(from, { text: `🔢 *Number Fact*\n\n${res.data.text}` });
  } catch { await sock.sendMessage(from, { text: '❌ Could not fetch number fact.' }); }
};
