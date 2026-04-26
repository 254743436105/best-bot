const { exec } = require('child_process');
const fs   = require('fs');
const path = require('path');

const TMP_DIR = path.join(__dirname, '../tmp');

async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !play <song name>' });
  }

  const query = args.join(' ');
  await sock.sendMessage(jid, { text: `🎵 Searching for *${query}*...` });

  fs.mkdirSync(TMP_DIR, { recursive: true });

  const outTemplate = path.join(TMP_DIR, `audio_${Date.now()}.%(ext)s`);
  const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 5 -o "${outTemplate}" "ytsearch1:${query}"`;

  exec(cmd, { timeout: 120000 }, async (err, stdout, stderr) => {
    if (err) {
      console.error('yt-dlp error:', stderr);
      return sock.sendMessage(jid, { text: `❌ Could not download audio.\n${stderr.slice(0, 200)}` });
    }

    // Find the downloaded file
    const files = fs.readdirSync(TMP_DIR).filter(f => f.startsWith('audio_') && f.endsWith('.mp3'));
    if (!files.length) {
      return sock.sendMessage(jid, { text: '❌ Audio file not found after download.' });
    }

    const file = path.join(TMP_DIR, files[files.length - 1]);

    try {
      await sock.sendMessage(jid, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mpeg',
        ptt: false,
      });
    } catch (e) {
      await sock.sendMessage(jid, { text: `❌ Failed to send audio: ${e.message}` });
    } finally {
      fs.unlinkSync(file);
    }
  });
}

module.exports = { execute };
