const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TMP_DIR = path.resolve('./tmp');

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!tts <text>`\nExample: `!tts Hello how are you`',
    });
  }

  const text = args.join(' ');
  if (text.length > 200) {
    return sock.sendMessage(from, { text: '❌ Text too long. Max 200 characters.' });
  }

  try {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

    const url = `https://api.voicerss.org/?key=&hl=en-us&src=${encodeURIComponent(text)}&f=44khz_16bit_stereo&c=mp3`;
    // Use free Google TTS
    const googleTTS = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    const res = await axios.get(googleTTS, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const audioPath = path.join(TMP_DIR, 'tts.mp3');
    fs.writeFileSync(audioPath, res.data);

    await sock.sendMessage(from, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mp4',
      ptt: true, // voice note style
    }, { quoted: msg });

    fs.unlinkSync(audioPath);
  } catch (err) {
    console.error('TTS error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to generate audio. Try again later.' });
  }
};
