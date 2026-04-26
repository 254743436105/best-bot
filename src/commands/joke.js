const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

async function execute(sock, msg, args, jid) {
  try {
    const data = await fetchJSON('https://icanhazdadjoke.com/');
    await sock.sendMessage(jid, { text: `😂 *Joke of the moment:*\n\n${data.joke}` });
  } catch (e) {
    await sock.sendMessage(jid, { text: '😅 Could not fetch a joke right now. Try again!' });
  }
}

module.exports = { execute };
