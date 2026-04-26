const { listReminders, deleteReminder } = require('../handlers/reminderHandler');

async function execute(sock, msg, args, jid) {
  // !reminders del <id>
  if (args[0] === 'del' && args[1]) {
    const deleted = deleteReminder(args[1]);
    return sock.sendMessage(jid, {
      text: deleted ? `🗑️ Reminder \`${args[1]}\` deleted.` : `❌ Reminder not found.`,
    });
  }

  const list = listReminders(jid);
  if (!list.length) {
    return sock.sendMessage(jid, { text: '📭 No active reminders.' });
  }

  const lines = list.map((r, i) => {
    const due = new Date(r.fireAt).toLocaleString('en-KE', { timeZone: process.env.TIMEZONE || 'Africa/Nairobi' });
    return `${i + 1}. [${r.id}] *${r.text}*\n   ⏰ ${due}`;
  });

  await sock.sendMessage(jid, { text: `📋 *Active Reminders*\n\n${lines.join('\n\n')}` });
}

module.exports = { execute };
