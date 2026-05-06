// src/commands/lyrics.js
async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '🎵 Usage: !lyrics <song name> - <artist>' });
  }

  try {
    const query = args.join(' ');
    const searchRes = await fetch(`https://lyrist.vercel.app/api/${encodeURIComponent(query)}`);
    const data = await searchRes.json();

    if (!data || !data.lyrics) {
      return sock.sendMessage(jid, { text: '❌ Lyrics not found. Try: !lyrics Blinding Lights - The Weeknd' });
    }

    // Trim lyrics to avoid too-long messages
    const lyrics = data.lyrics.length > 3000
      ? data.lyrics.substring(0, 3000) + '\n\n... _(truncated)_'
      : data.lyrics;

    await sock.sendMessage(jid, {
      text: `🎵 *${data.title}*\n👤 ${data.artist}\n\n${lyrics}`
    });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Could not fetch lyrics. Try again.' });
  }
}
module.exports = { execute };
