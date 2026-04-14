const axios = require('axios');

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!define <word>`\nExample: `!define serendipity`',
    });
  }

  const word = args[0].toLowerCase();

  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
      timeout: 8000,
    });

    const entry = res.data[0];
    const meanings = entry.meanings.slice(0, 2); // max 2 parts of speech

    let text = `📖 *${entry.word}*\n`;
    if (entry.phonetic) text += `🔊 ${entry.phonetic}\n`;
    text += `━━━━━━━━━━━━━━━\n`;

    for (const meaning of meanings) {
      text += `\n*${meaning.partOfSpeech}*\n`;
      const defs = meaning.definitions.slice(0, 2);
      defs.forEach((d, i) => {
        text += `${i + 1}. ${d.definition}\n`;
        if (d.example) text += `   _e.g. "${d.example}"_\n`;
      });
      if (meaning.synonyms?.length) {
        text += `Synonyms: ${meaning.synonyms.slice(0, 4).join(', ')}\n`;
      }
    }

    await sock.sendMessage(from, { text: text.trim() });
  } catch (err) {
    if (err.response?.status === 404) {
      return sock.sendMessage(from, { text: `❌ Word not found: *${word}*` });
    }
    await sock.sendMessage(from, { text: '❌ Could not fetch definition. Try again later.' });
  }
};
