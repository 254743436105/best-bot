module.exports = async (sock, msg, args, from) => {
  // Only works in groups
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ This command only works in groups!' });
  }

  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (!mentionedJids.length && !quoted?.participant) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!kick @user`\n\nMention the person you want to remove.\nExample: `!kick @John`\n\n⚠️ Bot must be group admin.',
    });
  }

  const targets = mentionedJids.length ? mentionedJids : [quoted.participant];

  try {
    // Check bot is admin
    const groupMetadata = await sock.groupMetadata(from);
    const botId = sock.user.id.replace(/:.*@/, '@');
    const botMember = groupMetadata.participants.find(p => p.id === botId);

    if (!botMember || botMember.admin !== 'admin' && botMember.admin !== 'superadmin') {
      return sock.sendMessage(from, { text: '❌ I need to be a group admin to remove members.' });
    }

    // Remove each mentioned user
    for (const jid of targets) {
      await sock.groupParticipantsUpdate(from, [jid], 'remove');
      const number = jid.split('@')[0];
      await sock.sendMessage(from, { text: `✅ @${number} has been removed from the group.`, mentions: [jid] });
    }

  } catch (err) {
    console.error('Kick error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to remove member. Make sure I am a group admin.' });
  }
};
