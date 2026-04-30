const PREFIX = process.env.PREFIX || '!';

async function execute(sock, msg, args, jid) {
  const text = `
🤖 *WhatsApp Bot Commands*

━━━━━━━━━━━━━━━━━━
📌 *General*
━━━━━━━━━━━━━━━━━━
${PREFIX}help               — Show this menu
${PREFIX}ping               — Check bot status
${PREFIX}time               — Current date & time
${PREFIX}fact               — Random fun fact
${PREFIX}joke               — Random joke
${PREFIX}quote              — Inspirational quote
${PREFIX}define <word>      — Dictionary definition

━━━━━━━━━━━━━━━━━━
🌤️ *Utilities*
━━━━━━━━━━━━━━━━━━
${PREFIX}weather <city>     — Live weather info
${PREFIX}calc <expr>        — Calculator (e.g. 15% of 3000)
${PREFIX}remind <time> <text> — Set reminder (30m, 2h, 1d)
${PREFIX}reminders          — List your reminders
${PREFIX}reminders del <id> — Delete a reminder
${PREFIX}presence <type>    — Set typing/recording/online/offline

━━━━━━━━━━━━━━━━━━
🎵 *Media*
━━━━━━━━━━━━━━━━━━
${PREFIX}play <song>        — Search & send audio
${PREFIX}lyrics <song>      — Get song lyrics
${PREFIX}sticker            — Image → sticker (reply to image)
${PREFIX}app <name>         — Search Google Play Store

━━━━━━━━━━━━━━━━━━
📖 *Religion*
━━━━━━━━━━━━━━━━━━
${PREFIX}bible <ref>        — Bible verse (e.g. John 3:16)
${PREFIX}bible random       — Random Bible verse
${PREFIX}quran <ref>        — Quran verse (e.g. 2:255)
${PREFIX}quran random       — Random Quran verse

━━━━━━━━━━━━━━━━━━
⚽ *Sports & News*
━━━━━━━━━━━━━━━━━━
${PREFIX}sports             — Latest sports news
${PREFIX}sports <topic>     — Sports news by topic

━━━━━━━━━━━━━━━━━━
🤖 *AI*
━━━━━━━━━━━━━━━━━━
${PREFIX}ai <question>      — Ask AI anything

━━━━━━━━━━━━━━━━━━
👥 *Groups*
━━━━━━━━━━━━━━━━━━
${PREFIX}welcome on/off     — Toggle welcome messages
${PREFIX}goodbye on/off     — Toggle goodbye messages

━━━━━━━━━━━━━━━━━━
😂 *Fun*
━━━━━━━━━━━━━━━━━━
${PREFIX}hack <target>      — Fake hacker prank 😂
${PREFIX}statusview on/off  — Auto view statuses
${PREFIX}qr                 — Session QR info
`.trim();

  await sock.sendMessage(jid, { text });
}

module.exports = { execute };
