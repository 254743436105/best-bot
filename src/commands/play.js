const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const TMP_DIR = '/tmp/bot-audio';

async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !play <song name>' });
  }

  const query = args.join(' ');
  await sock.sendMessage(jid, { text: `🎵 Searching for *${query}*...` });

  fs.mkdirSync(TMP_DIR, { recursive: true });

  const fileName = `audio_${Date.now()}`;
  const outTemplate = path.join(TMP_DIR, `${fileName}.%(ext)s`);

  const cmd = [
    'yt-dlp',
    '-x',
    '--audio-format mp3',
    '--audio-quality 5',
    '--no-playlist',
    '--max-filesize 30m',
    '--socket-timeout 30',
    `-o "${outTemplate}"`,
    `"ytsearch1:${query}"`,
  ].join(' ');

  exec(cmd, { timeout: 120000 }, async (err, stdout, stderr) => {
    if (err) {
      console.error('yt-dlp error:', stderr);
      return sock.sendMessage(jid, { text: `❌ Could not find or download *${query}*.\nTry a more specific song name.` });
    }

    // Find downloaded file
    let files = [];
    try {
      files = fs.readdirSync(TMP_DIR).filter(f => f.startsWith(fileName));
    } catch (e) {
      return sock.sendMessage(jid, { text: '❌ Error reading audio file.' });
    }

    if (!files.length) {
      return sock.sendMessage(jid, { text: '❌ Audio file not found after download.' });
    }

    const file = path.join(TMP_DIR, files[0]);

    try {
      const stat = fs.statSync(file);
      if (stat.size > 30 * 1024 * 1024) {
        fs.unlinkSync(file);
        return sock.sendMessage(jid, { text: '❌ Audio file too large to send (max 30MB).' });
      }

      await sock.sendMessage(jid, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mpeg',
        ptt: false,
      });

      await sock.sendMessage(jid, { text: `✅ *${query}*\n🎵 Enjoy the music!` });
    } catch (e) {
      await sock.sendMessage(jid, { text: `❌ Failed to send audio: ${e.message}` });
    } finally {
      try { fs.unlinkSync(file); } catch {}
    }
  });
}

module.exports = { execute };
