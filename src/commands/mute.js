module.exports = async (sock, msg, args, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ This command only works in groups!' });
  }

  const sub = (args[0] || '').toLowerCase();

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const botId = sock.user.id.replace(/:.*@/, '@');
    const botMember = groupMetadata.participants.find(p => p.id === botId);

    if (!botMember?.admin) {
      return sock.sendMessage(from, { text: '❌ I need to be a group admin to mute/unmute.' });
    }

    if (sub === 'on') {
      await sock.groupSettingUpdate(from, 'announcement');
      await sock.sendMessage(from, { text: '🔇 Group muted! Only admins can send messages now.' });
    } else if (sub === 'off') {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await sock.sendMessage(from, { text: '🔊 Group unmuted! Everyone can send messages now.' });
    } else {
      await sock.sendMessage(from, {
        text: '⚠️ Usage:\n• `!mute on` — Only admins can message\n• `!mute off` — Everyone can message',
      });
    }
  } catch (err) {
    console.error('Mute error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to update group settings.' });
  }
};
