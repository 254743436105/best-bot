module.exports = async (sock, msg, args, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ This command only works in groups!' });
  }

  const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  const targets = mentionedJids.length ? mentionedJids : quoted?.participant ? [quoted.participant] : [];

  if (!targets.length) {
    return sock.sendMessage(from, { text: '⚠️ Usage: `!promote @user`\nMention the person to promote to admin.' });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const botId = sock.user.id.replace(/:.*@/, '@');
    const botMember = groupMetadata.participants.find(p => p.id === botId);

    if (!botMember?.admin) {
      return sock.sendMessage(from, { text: '❌ I need to be a group admin to promote members.' });
    }

    for (const jid of targets) {
      await sock.groupParticipantsUpdate(from, [jid], 'promote');
      const number = jid.split('@')[0];
      await sock.sendMessage(from, { text: `⬆️ @${number} has been promoted to admin! 👑`, mentions: [jid] });
    }
  } catch (err) {
    console.error('Promote error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to promote member.' });
  }
};
