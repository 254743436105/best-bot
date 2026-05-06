// src/commands/bible.js
async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '📖 Usage: !bible John 3:16 or !bible random' });
  }

  try {
    let url;
    if (args[0].toLowerCase() === 'random') {
      url = 'https://bible-api.com/?random=verse';
    } else {
      const ref = args.join(' ');
      url = `https://bible-api.com/${encodeURIComponent(ref)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) return sock.sendMessage(jid, { text: `❌ Verse not found. Try: !bible John 3:16` });

    const text = `📖 *${data.reference}*\n\n_"${data.text.trim()}"_\n\n— KJV Bible`;
    await sock.sendMessage(jid, { text });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Failed to fetch Bible verse. Try again.' });
  }
}
module.exports = { execute };
