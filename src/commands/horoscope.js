const axios = require('axios');
const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
module.exports = async (sock, msg, args, from) => {
  const sign = (args[0] || '').toLowerCase();
  if (!sign || !signs.includes(sign)) {
    return sock.sendMessage(from, { text: `⭐ *Horoscope*\n\nUsage: \`!horoscope <sign>\`\n\nSigns: ${signs.join(', ')}` });
  }
  try {
    const res = await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, {}, { timeout: 8000 });
    const d = res.data;
    await sock.sendMessage(from, { text: `⭐ *${sign.toUpperCase()} Horoscope*\n━━━━━━━━━━━━━━━\n📖 ${d.description}\n\n💕 Compatibility: ${d.compatibility}\n🎨 Color: ${d.color}\n🔢 Lucky Number: ${d.lucky_number}\n⏰ ${d.date_range}` });
  } catch {
    await sock.sendMessage(from, { text: '❌ Could not fetch horoscope. Try again later.' });
  }
};
