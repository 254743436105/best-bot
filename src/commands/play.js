const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const TMP_DIR = path.resolve('./tmp');

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!play <song name or YouTube URL>`\nExample: `!play Shape of You Ed Sheeran`',
    });
  }

  const query = args.join(' ');
  await sock.sendMessage(from, { text: `🔍 Searching for: *${query}*...` });

  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const outputTemplate = path.join(TMP_DIR, '%(title)s.%(ext)s');

  try {
    // Check yt-dlp is available
    await execAsync('yt-dlp --version').catch(() => {
      throw new Error('yt-dlp not installed');
    });

    // Search and download best audio up to 10MB
    const isUrl = query.startsWith('http');
    const searchQuery = isUrl ? query : `ytsearch1:${query}`;

    const { stdout } = await execAsync(
      `yt-dlp -x --audio-format mp3 --audio-quality 5 --max-filesize 10m ` +
      `--print "%(title)s|%(duration)s|%(uploader)s" ` +
      `-o "${outputTemplate}" "${searchQuery}" 2>&1`,
      { timeout: 60000 }
    );

    // Parse info from stdout
    const infoLine = stdout.split('\n').find((l) => l.includes('|'));
    const [title = query, duration = '?', uploader = '?'] = (infoLine || '').split('|');

    // Find the downloaded file
    const files = fs.readdirSync(TMP_DIR).filter((f) => f.endsWith('.mp3'));
    if (!files.length) throw new Error('No audio file found after download');

    const audioPath = path.join(TMP_DIR, files[0]);
    const stats = fs.statSync(audioPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    await sock.sendMessage(from, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mp4',
      ptt: false, // false = music player UI, true = voice note UI
      fileName: `${title}.mp3`,
    }, { quoted: msg });

    await sock.sendMessage(from, {
      text: `🎵 *${title}*\n👤 ${uploader}\n⏱️ ${duration}s | 📦 ${sizeMB} MB`,
    });

    // Cleanup
    fs.unlinkSync(audioPath);

  } catch (err) {
    console.error('Play error:', err.message);

    if (err.message.includes('yt-dlp not installed')) {
      return sock.sendMessage(from, {
        text: '❌ *yt-dlp is not installed on this server.*\n\nAsk your admin to run:\n`pip install yt-dlp`',
      });
    }

    if (err.message.includes('File is larger')) {
      return sock.sendMessage(from, {
        text: '❌ File is too large (>10MB). Try a shorter song.',
      });
    }

    await sock.sendMessage(from, {
      text: `❌ Could not download: *${query}*\n\nTry a different song name or paste a YouTube URL directly.`,
    });
  }
};
