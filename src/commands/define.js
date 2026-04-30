// src/commands/define.js
async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '📚 Usage: !define <word>\nExample: !define serendipity' });
  }

  const word = args[0].toLowerCase();

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      return sock.sendMessage(jid, { text: `❌ No definition found for *${word}*` });
    }

    const entry = data[0];
    const meanings = entry.meanings.slice(0, 2).map(m => {
      const def = m.definitions[0];
      return `*${m.partOfSpeech}:* ${def.definition}${def.example ? `\n_Example: "${def.example}"_` : ''}`;
    }).join('\n\n');

    const phonetic = entry.phonetic || '';
    await sock.sendMessage(jid, {
      text: `📚 *${entry.word}* ${phonetic}\n\n${meanings}`
    });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Could not fetch definition. Try again.' });
  }
}
module.exports = { execute };
