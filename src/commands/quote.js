const https = require('https');

const fallback = [
  { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
  { q: 'In the middle of every difficulty lies opportunity.', a: 'Albert Einstein' },
  { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
  { q: 'Life is what happens when you\'re busy making other plans.', a: 'John Lennon' },
  { q: 'The future belongs to those who believe in the beauty of their dreams.', a: 'Eleanor Roosevelt' },
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

async function execute(sock, msg, args, jid) {
  try {
    const data = await fetchJSON('https://zenquotes.io/api/random');
    const { q, a } = data[0];
    await sock.sendMessage(jid, { text: `💬 *"${q}"*\n\n— _${a}_` });
  } catch {
    const r = fallback[Math.floor(Math.random() * fallback.length)];
    await sock.sendMessage(jid, { text: `💬 *"${r.q}"*\n\n— _${r.a}_` });
  }
}

module.exports = { execute };
