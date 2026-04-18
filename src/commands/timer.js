function parseTime(str) {
  const match = str?.match(/^(\d+)(s|m|h)$/i);
  if (!match) return null;
  const ms = { s: 1000, m: 60000, h: 3600000 }[match[2].toLowerCase()];
  return parseInt(match[1]) * ms;
}
module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage: `!timer <time>`\nExamples: `!timer 30s` `!timer 5m` `!timer 1h`' });
  const ms = parseTime(args[0]);
  if (!ms || ms > 3600000) return sock.sendMessage(from, { text: '❌ Invalid time. Max 1h. Use: 30s, 5m, 1h' });
  await sock.sendMessage(from, { text: `⏱️ Timer set for *${args[0]}*! I'll ping you when it's done.` });
  setTimeout(async () => {
    await sock.sendMessage(from, { text: `⏰ *Timer Done!* Your ${args[0]} timer has ended! 🔔` });
  }, ms);
};
