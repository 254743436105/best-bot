const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const TMP_DIR = path.resolve('./tmp');

async function ytdlpAvailable() {
  try { await execAsync('yt-dlp --version'); return true; }
  catch { return false; }
}

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '🎵 *Music Player*\n\nUsage:\n• `!play <song name>` — search and play\n• `!play <YouTube URL>` — play from URL\n\nExamples:\n• `!play Doja Cat Kiss Me More`\n• `!play https://youtu.be/xxxxx`',
    });
  }

  const query = args.join(' ');
  const isUrl = query.startsWith('http://') || query.startsWith('https://');

  await sock.sendMessage(from, { text: `🔍 *Searching:* _${query}_\nPlease wait...` });

  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const hasYtdlp = await ytdlpAvailable();
  if (!hasYtdlp) {
    return sock.sendMessage(from, {
      text: '❌ Music player not available on this server.\nyt-dlp is not installed.',
    });
  }

  const searchQuery = isUrl ? query : `ytsearch1:${query}`;
  const outputPath = path.join(TMP_DIR, 'audio.%(ext)s');

  try {
    // Get song info
    const { stdout: infoOut } = await execAsync(
      `yt-dlp --print "%(title)s|||%(duration>%M:%S)s|||%(uploader)s|||%(webpage_url)s" "${searchQuery}" --no-playlist`,
      { timeout: 30000 }
    );

    const [title, duration, uploader, songUrl] = infoOut.trim().split('|||');

    await sock.sendMessage(from, {
      text: `🎵 *Found:* ${title}\n👤 ${uploader} | ⏱️ ${duration}\n⬇️ Downloading...`,
    });

    // Download audio
    await execAsync(
      `yt-dlp -x --audio-format mp3 --audio-quality 5 --max-filesize 15m -o "${outputPath}" "${searchQuery}" --no-playlist`,
      { timeout: 120000 }
    );

    // Find file
    const files = fs.readdirSync(TMP_DIR).filter(f => f.includes('audio'));
    if (!files.length) throw new Error('No audio file downloaded');

    const audioPath = path.join(TMP_DIR, files[0]);
    const sizeMB = (fs.statSync(audioPath).size / 1024 / 1024).toFixed(2);

    // Send audio
    await sock.sendMessage(from, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${title}.mp3`,
    }, { quoted: msg });

    await sock.sendMessage(from, {
      text: `✅ *Now Playing*\n━━━━━━━━━━━━━━━\n🎵 ${title}\n👤 ${uploader}\n⏱️ ${duration} | 📦 ${sizeMB} MB\n🔗 ${songUrl}`,
    });

    fs.unlinkSync(audioPath);

  } catch (err) {
    console.error('Play error:', err.message);
    if (err.message.includes('filesize') || err.message.includes('larger')) {
      return sock.sendMessage(from, { text: '❌ Song too large (>15MB). Try a shorter song.' });
    }
    await sock.sendMessage(from, {
      text: `❌ Could not play: _${query}_\n\nTips:\n• Try a more specific song name\n• Paste a YouTube URL directly\n• Make sure song is publicly available`,
    });
  }
};
