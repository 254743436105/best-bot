const axios = require('axios');

const LANGUAGES = {
  en: 'English', sw: 'Swahili', fr: 'French', es: 'Spanish',
  de: 'German', ar: 'Arabic', zh: 'Chinese', hi: 'Hindi',
  pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
  it: 'Italian', tr: 'Turkish', nl: 'Dutch',
};

module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!translate <lang> <text>`\nExample: `!translate sw Hello how are you`\n\nLanguage codes:\nen=English, sw=Swahili, fr=French, es=Spanish, de=German, ar=Arabic, zh=Chinese, hi=Hindi',
    });
  }

  const [langCode, ...textParts] = args;
  const text = textParts.join(' ');
  const targetLang = langCode.toLowerCase();

  if (!LANGUAGES[targetLang]) {
    return sock.sendMessage(from, {
      text: `❌ Unknown language code: *${targetLang}*\nSupported: ${Object.keys(LANGUAGES).join(', ')}`,
    });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url, { timeout: 8000 });
    const translated = res.data[0].map(item => item[0]).join('');
    const detectedLang = res.data[2];

    await sock.sendMessage(from, {
      text: `🌍 *Translator*\n━━━━━━━━━━━━━━━\n📥 *Original:* ${text}\n📤 *${LANGUAGES[targetLang]}:* ${translated}\n🔍 Detected: ${LANGUAGES[detectedLang] || detectedLang}`,
    });
  } catch (err) {
    console.error('Translate error:', err.message);
    await sock.sendMessage(from, { text: '❌ Translation failed. Try again later.' });
  }
};
