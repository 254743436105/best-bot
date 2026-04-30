// src/commands/fact.js
async function execute(sock, msg, args, jid) {
  try {
    const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await res.json();
    await sock.sendMessage(jid, { text: `💡 *Random Fact*\n\n${data.text}` });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Could not fetch a fact. Try again.' });
  }
}
module.exports = { execute };
