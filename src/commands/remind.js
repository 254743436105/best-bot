const { addReminder } = require('../handlers/reminderHandler');

function parseTime(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * ms[unit];
}

async function execute(sock, msg, args, jid, sender) {
  if (args.length < 2) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !remind <time> <message>\nExample: !remind 30m Call John' });
  }

  const ms = parseTime(args[0]);
  if (!ms) {
    return sock.sendMessage(jid, { text: '⚠️ Invalid time. Use formats like: 30s, 5m, 2h, 1d' });
  }

  const text   = args.slice(1).join(' ');
  const fireAt = Date.now() + ms;
  const id     = addReminder({ jid, sender, text, fireAt });

  const humanTime = args[0];
  await sock.sendMessage(jid, { text: `✅ Reminder set!\n\n📝 *"${text}"*\n⏰ I'll remind you in *${humanTime}*\n🆔 ID: \`${id}\`` });
}

module.exports = { execute };
