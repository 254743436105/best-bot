const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const TMP_DIR = path.resolve('./tmp');

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '🎬 *Video Downloader*\n\nUsage: `!video <YouTube URL>`\nExample: `!video https://youtu.be/xxxxx`\n\n⚠️ Max 50MB. For audio only use `!play`',
    });
  }

  const url = args[0];
  if (!url.startsWith('http')) {
    return sock.sendMessage(from, { text: '❌ Please provide a valid URL.' });
  }

  await sock.sendMessage(from, { text: '⬇️ Downloading video... Please wait.' });

  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  try {
    // Get info first
    const { stdout: info } = await execAsync(
      `yt-dlp --print "%(title)s|||%(duration>%M:%S)s" "${url}" --no-playlist`,
      { timeout: 30000 }
    );
    const [title, duration] = info.trim().split('|||');

    // Download video (max 50MB, 480p to keep size manageable)
    const outputPath = path.join(TMP_DIR, 'video.%(ext)s');
    await execAsync(
      `yt-dlp -f "best[height<=480][filesize<50M]/best[height<=480]/best" --max-filesize 50m -o "${outputPath}" "${url}" --no-playlist`,
      { timeout: 180000 }
    );

    const files = fs.readdirSync(TMP_DIR).filter(f => f.startsWith('video.'));
    if (!files.length) throw new Error('No video file downloaded');

    const videoPath = path.join(TMP_DIR, files[0]);
    const sizeMB = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(2);

    await sock.sendMessage(from, {
      video: fs.readFileSync(videoPath),
      caption: `🎬 *${title}*\n⏱️ ${duration} | 📦 ${sizeMB} MB`,
      mimetype: 'video/mp4',
    }, { quoted: msg });

    fs.unlinkSync(videoPath);

  } catch (err) {
    console.error('Video error:', err.message);
    if (err.message.includes('filesize') || err.message.includes('larger')) {
      return sock.sendMessage(from, { text: '❌ Video too large (>50MB). Try a shorter video.' });
    }
    await sock.sendMessage(from, { text: '❌ Could not download video. Make sure the URL is valid and public.' });
  }
};
