const { isEnabled, setEnabled, getSaved } = require('../handlers/statusSaveHandler');

module.exports = async (sock, msg, args, from) => {
  const sub = (args[0] || '').toLowerCase();

  if (sub === 'on') {
    // Pass bot's own JID so statuses get sent to own inbox
    const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    setEnabled(true, ownerJid);
    return sock.sendMessage(from, {
      text: `💾 *Status Saver ON!* ✅\n\nAll your contacts' statuses will be *automatically downloaded and sent to your inbox* 📥\n\n📸 Images, 🎬 Videos and 📝 Text statuses included.\n\nUse \`!savestatus off\` to stop.`,
    });
  }

  if (sub === 'off') {
    setEnabled(false);
    return sock.sendMessage(from, { text: '💾 *Status Saver OFF.* Statuses will no longer be auto-saved.' });
  }

  if (sub === 'list') {
    const saved = getSaved();
    if (!saved.length) return sock.sendMessage(from, { text: '📭 No statuses saved yet.\n\nEnable with `!savestatus on` first.' });
    const list = saved.slice(-10).reverse().map((s, i) =>
      `${i+1}. 👤 +${s.sender} | ${s.type.toUpperCase()} | ${s.timestamp}`
    );
    return sock.sendMessage(from, { text: `💾 *Saved Statuses (${saved.length} total)*\n━━━━━━━━━━━━━━━\n${list.join('\n')}` });
  }

  const current = isEnabled();
  await sock.sendMessage(from, {
    text: `💾 *Status Saver*\n\nStatus: *${current ? 'ON ✅ — Auto-saving to inbox' : 'OFF ❌'}*\n\nCommands:\n• \`!savestatus on\` — Auto-save all statuses to inbox\n• \`!savestatus off\` — Stop saving\n• \`!savestatus list\` — View recent saved statuses`,
  });
};
