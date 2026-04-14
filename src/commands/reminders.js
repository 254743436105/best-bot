const { listReminders, deleteReminder } = require('../handlers/reminderHandler');

module.exports = async (sock, msg, args, from) => {
  // Delete subcommand
  if (args[0] === 'del' && args[1]) {
    const deleted = deleteReminder(from, args[1]);
    return sock.sendMessage(from, {
      text: deleted ? `🗑️ Reminder *${args[1]}* deleted.` : `❌ Reminder not found with ID *${args[1]}*.`,
    });
  }

  const list = listReminders(from);

  if (list.length === 0) {
    return sock.sendMessage(from, { text: '📭 You have no active reminders.' });
  }

  const tz = process.env.TIMEZONE || 'Africa/Nairobi';
  const lines = list.map((r, i) => {
    const time = new Date(r.time).toLocaleString('en-KE', { timeZone: tz });
    return `${i + 1}. 📝 "${r.text}"\n   ⏰ ${time}\n   🆔 ID: ${r.id}`;
  });

  await sock.sendMessage(from, {
    text: `⏰ *Your Reminders (${list.length})*\n━━━━━━━━━━━━━━━\n${lines.join('\n\n')}\n━━━━━━━━━━━━━━━\nTo delete: \`!reminders del <id>\``,
  });
};
