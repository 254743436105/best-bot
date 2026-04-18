module.exports = async (sock, msg, args, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ This command only works in groups!' });
  }

  const mentioned =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.groupMention?.mentionedJid || [];

  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const targets = mentioned.length ? mentioned : quotedParticipant ? [quotedParticipant] : [];

  if (!targets.length) {
    return sock.sendMessage(from, {
      text: '⚠️ *Usage:* `!promote @user`\nMention someone to make them admin.\n\n_Bot must be group admin._',
    });
  }

  try {
    const group = await sock.groupMetadata(from);
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = group.participants.find(p => p.id.includes(botJid.split('@')[0]));

    if (!bot || !bot.admin) {
      return sock.sendMessage(from, { text: '❌ I need to be a *group admin* to promote members.' });
    }

    for (const jid of targets) {
      try {
        await sock.groupParticipantsUpdate(from, [jid], 'promote');
        await sock.sendMessage(from, {
          text: `⬆️ @${jid.split('@')[0]} has been promoted to admin! 👑`,
          mentions: [jid],
        });
      } catch (e) {
        await sock.sendMessage(from, { text: `❌ Could not promote @${jid.split('@')[0]}: ${e.message}` });
      }
    }
  } catch (err) {
    console.error('Promote error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed. Make sure I am a group admin.' });
  }
};
