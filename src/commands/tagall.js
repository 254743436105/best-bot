module.exports = async (sock, msg, args, from) => {
  // Only works in groups
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ This command only works in groups!' });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    if (!participants || participants.length === 0) {
      return sock.sendMessage(from, { text: '❌ Could not fetch group members.' });
    }

    const message = args.length ? args.join(' ') : '👋 Attention everyone!';

    // Build mention list
    const mentions = participants.map(p => p.id);

    // Build text with all mentions
    const mentionText = participants
      .map(p => `@${p.id.split('@')[0]}`)
      .join(' ');

    await sock.sendMessage(from, {
      text: `📢 *${message}*\n\n${mentionText}`,
      mentions,
    });

  } catch (err) {
    console.error('Tagall error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to tag members. Make sure I am a group admin.' });
  }
};
