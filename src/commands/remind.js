const { addReminder } = require('../handlers/reminderHandler');

function parseTime(str) {
  const match = str.match(/^(\d+)(m|h|d)$/i);
  if (!match) return null;
  const [, num, unit] = match;
  const ms = { m: 60000, h: 3600000, d: 86400000 }[unit.toLowerCase()];
  return parseInt(num) * ms;
}

module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!remind <time> <message>`\n\n_Time formats: 10m, 2h, 1d_\nExample: `!remind 30m Call John`',
    });
  }

  const [timeStr, ...msgParts] = args;
  const ms = parseTime(timeStr);

  if (!ms) {
    return sock.sendMessage(from, {
      text: '❌ Invalid time format. Use: `10m`, `2h`, `1d`',
    });
  }

  const reminderText = msgParts.join(' ');
  const triggerTime = Date.now() + ms;
  const reminder = addReminder(from, reminderText, triggerTime);

  const readableTime = new Date(triggerTime).toLocaleTimeString('en-KE', {
    timeZone: process.env.TIMEZONE || 'Africa/Nairobi',
    hour: '2-digit', minute: '2-digit',
  });

  await sock.sendMessage(from, {
    text: `✅ *Reminder set!*\n\n📝 "${reminderText}"\n⏰ I'll remind you in *${timeStr}* (at ${readableTime})\n🆔 ID: ${reminder.id}`,
  });
};
