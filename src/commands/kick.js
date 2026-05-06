module.exports = async (sock, msg, args, jid) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(jid, { text: '❌ This command only works in groups!' });
  }

  // Get mentioned users from message
  const mentioned =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.groupMention?.mentionedJid || [];

  // Also check quoted message participant
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

  const targets = mentioned.length ? mentioned : quotedParticipant ? [quotedParticipant] : [];

  if (!targets.length) {
    return sock.sendMessage(jid, {
      text: '⚠️ *Usage:* `!kick @user`\nMention someone to remove them.\n\n_Bot must be group admin._',
    });
  }

  try {
    const group = await sock.groupMetadata(from);
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = group.participants.find(p => p.id.includes(botJid.split('@')[0]));

    if (!bot || !bot.admin) {
      return sock.sendMessage(jid, { text: '❌ I need to be a *group admin* to remove members.' });
    }

    for (const jid of targets) {
      try {
        await sock.groupParticipantsUpdate(from, [jid], 'remove');
        await sock.sendMessage(jid, {
          text: `✅ @${jid.split('@')[0]} has been removed from the group.`,
          mentions: [jid],
        });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Could not remove @${jid.split('@')[0]}: ${e.message}` });
      }
    }
  } catch (err) {
    console.error('Kick error:', err.message);
    await sock.sendMessage(jid, { text: '❌ Failed. Make sure I am a group admin.' });
  }
};
