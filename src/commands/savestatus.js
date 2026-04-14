const { isEnabled, setEnabled, getSaved } = require('../handlers/statusSaveHandler');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = async (sock, msg, args, from) => {
  const sub = (args[0] || '').toLowerCase();

  if (sub === 'on') {
    setEnabled(true);
    return sock.sendMessage(from, {
      text: '💾 *Status Saver ON!*\n\nI will now automatically save all your contacts\' statuses. 📸\n\nUse `!savestatus list` to view saved statuses.',
    });
  }

  if (sub === 'off') {
    setEnabled(false);
    return sock.sendMessage(from, { text: '💾 *Status Saver OFF.*' });
  }

  if (sub === 'list') {
    const saved = getSaved();
    if (!saved.length) {
      return sock.sendMessage(from, { text: '📭 No statuses saved yet.\n\nEnable with `!savestatus on` first.' });
    }

    const list = saved.slice(-10).map((s, i) =>
      `${i + 1}. 👤 @${s.sender} | ${s.type.toUpperCase()} | ${s.timestamp}${s.caption ? `\n   💬 ${s.caption.substring(0, 50)}` : ''}`
    );

    return sock.sendMessage(from, {
      text: `💾 *Saved Statuses (last ${saved.length})*\n━━━━━━━━━━━━━━━\n${list.join('\n\n')}\n━━━━━━━━━━━━━━━\nUse \`!savestatus get <number>\` to download`,
    });
  }

  if (sub === 'get') {
    const index = parseInt(args[1]) - 1;
    const saved = getSaved();

    if (isNaN(index) || index < 0 || index >= saved.length) {
      return sock.sendMessage(from, { text: `❌ Invalid number. Use \`!savestatus list\` to see saved statuses.` });
    }

    const status = saved[index];

    try {
      if (status.type === 'text') {
        return sock.sendMessage(from, {
          text: `📝 *Status from @${status.sender}*\n━━━━━━━━━━━━━━━\n${status.caption}\n━━━━━━━━━━━━━━━\n🕐 ${status.timestamp}`,
        });
      }

      const buffer = await downloadMediaMessage(status.msg, 'buffer', {});

      if (status.type === 'image') {
        await sock.sendMessage(from, {
          image: buffer,
          caption: `📸 *Status from @${status.sender}*\n${status.caption || ''}\n🕐 ${status.timestamp}`,
        });
      } else if (status.type === 'video') {
        await sock.sendMessage(from, {
          video: buffer,
          caption: `🎬 *Status from @${status.sender}*\n${status.caption || ''}\n🕐 ${status.timestamp}`,
          mimetype: 'video/mp4',
        });
      }
    } catch (err) {
      console.error('Status get error:', err.message);
      await sock.sendMessage(from, { text: '❌ Could not retrieve status. It may have expired.' });
    }
    return;
  }

  const current = isEnabled();
  await sock.sendMessage(from, {
    text: `💾 *Status Saver*\n\nStatus: *${current ? 'ON ✅' : 'OFF ❌'}*\n\nCommands:\n• \`!savestatus on\` — Start saving statuses\n• \`!savestatus off\` — Stop saving\n• \`!savestatus list\` — View saved statuses\n• \`!savestatus get <number>\` — Download a status`,
  });
};
