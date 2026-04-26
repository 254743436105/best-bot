const PREFIX = process.env.PREFIX || '!';

async function execute(sock, msg, args, jid) {
  const text = `
🤖 *WhatsApp Bot Commands*

${PREFIX}help          — Show this menu
${PREFIX}ping          — Check bot status
${PREFIX}time          — Current date & time
${PREFIX}weather <city> — Live weather info
${PREFIX}remind <time> <text> — Set a reminder (e.g. 30m, 2h, 1d)
${PREFIX}reminders     — List your reminders
${PREFIX}reminders del <id> — Delete a reminder
${PREFIX}calc <expr>   — Calculator (e.g. 15% of 3000)
${PREFIX}play <song>   — Search & send audio
${PREFIX}statusview on/off — Toggle auto status view
${PREFIX}joke          — Random joke
${PREFIX}quote         — Inspirational quote
${PREFIX}sticker       — Convert image to sticker (reply to image)
${PREFIX}welcome on/off — Toggle welcome messages (groups)
${PREFIX}goodbye on/off — Toggle goodbye messages (groups)
`.trim();

  await sock.sendMessage(jid, { text });
}

module.exports = { execute };
