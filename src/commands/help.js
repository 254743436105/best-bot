const PREFIX = process.env.PREFIX || '!';

module.exports = async (sock, msg, args, from) => {
  const text = `
🤖 *Personal Assistant Bot*
━━━━━━━━━━━━━━━━━━━━
📋 *General*
• \`${PREFIX}help\` — Show this menu
• \`${PREFIX}ping\` — Check if bot is alive
• \`${PREFIX}time\` — Show current time & date

🌤️ *Weather*
• \`${PREFIX}weather <city>\` — Live weather
  _e.g. ${PREFIX}weather Nairobi_

⏰ *Reminders*
• \`${PREFIX}remind <time> <message>\`
  Time formats: 10m, 2h, 1d
  _e.g. ${PREFIX}remind 30m Call John_
• \`${PREFIX}reminders\` — List your reminders
• \`${PREFIX}reminders del <id>\` — Delete a reminder

🧮 *Calculator*
• \`${PREFIX}calc <expression>\`
  _e.g. ${PREFIX}calc 15% of 3000_

🎵 *Music*
• \`${PREFIX}play <song name>\` — Search & send audio
• \`${PREFIX}play <YouTube URL>\` — Audio from a URL

👁️ *Status*
• \`${PREFIX}statusview\` — Check auto view setting
• \`${PREFIX}statusview on\` — Auto-view contacts' statuses
• \`${PREFIX}statusview off\` — Stop auto-viewing statuses

😄 *Fun*
• \`${PREFIX}joke\` — Get a random joke
• \`${PREFIX}quote\` — Get an inspirational quote
• \`${PREFIX}sticker\` — Convert image to sticker
  _(reply to an image with this command)_

━━━━━━━━━━━━━━━━━━━━
Prefix: \`${PREFIX}\` | Made with ❤️
`.trim();

  await sock.sendMessage(from, { text });
};
