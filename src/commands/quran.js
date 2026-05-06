// src/commands/quran.js
async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '🕌 Usage: !quran 2:255 or !quran random' });
  }

  try {
    let surah, ayah;

    if (args[0].toLowerCase() === 'random') {
      surah = Math.floor(Math.random() * 114) + 1;
      ayah = Math.floor(Math.random() * 10) + 1;
    } else {
      const parts = args[0].split(':');
      if (parts.length !== 2) return sock.sendMessage(jid, { text: '❌ Format: !quran 2:255' });
      surah = parts[0];
      ayah = parts[1];
    }

    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.asad`);
    const data = await res.json();

    if (data.code !== 200) return sock.sendMessage(jid, { text: '❌ Verse not found. Try: !quran 2:255' });

    const arabic = data.data[0];
    const english = data.data[1];

    const text = `🕌 *Surah ${arabic.surah.englishName} (${arabic.surah.name}) — Ayah ${arabic.numberInSurah}*\n\n${arabic.text}\n\n_"${english.text}"_\n\n— Al-Quran`;
    await sock.sendMessage(jid, { text });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Failed to fetch Quran verse. Try again.' });
  }
}
module.exports = { execute };
