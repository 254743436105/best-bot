const axios = require('axios');

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '🎵 Usage: `!lyrics <song name> - <artist>`\nExample: `!lyrics Shape of You - Ed Sheeran`',
    });
  }

  const query = args.join(' ');
  await sock.sendMessage(from, { text: `🔍 Searching lyrics for: _${query}_...` });

  try {
    // Search song
    const searchRes = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`, {
      timeout: 8000,
    });

    const song = searchRes.data?.data?.[0];
    if (!song) return sock.sendMessage(from, { text: `❌ No lyrics found for: *${query}*` });

    // Get lyrics
    const lyricsRes = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist.name)}/${encodeURIComponent(song.title)}`, {
      timeout: 8000,
    });

    let lyrics = lyricsRes.data?.lyrics;
    if (!lyrics) return sock.sendMessage(from, { text: `❌ Lyrics not found for: *${song.title}*` });

    // Truncate if too long
    if (lyrics.length > 3000) lyrics = lyrics.substring(0, 3000) + '\n\n_...lyrics truncated_';

    await sock.sendMessage(from, {
      text: `🎵 *${song.title}*\n👤 ${song.artist.name}\n━━━━━━━━━━━━━━━\n${lyrics}`,
    });
  } catch (err) {
    console.error('Lyrics error:', err.message);
    await sock.sendMessage(from, { text: '❌ Could not fetch lyrics. Try artist - song format.' });
  }
};
