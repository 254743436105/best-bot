module.exports = async (sock, msg, args, jid) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(jid, { text: '❌ This command only works in groups!' });
  }

  try {
    const group = await sock.groupMetadata(from);
    const admins = group.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`);
    const members = group.participants.length;
    const created = new Date(group.creation * 1000).toLocaleDateString('en-KE');

    await sock.sendMessage(jid, {
      text: `👥 *Group Info*\n━━━━━━━━━━━━━━━\n📛 Name: *${group.subject}*\n👤 Members: *${members}*\n📅 Created: *${created}*\n👑 Admins: ${admins.join(', ')}\n━━━━━━━━━━━━━━━\n📝 Description:\n${group.desc || 'No description'}`,
      mentions: group.participants.filter(p => p.admin).map(p => p.id),
    });
  } catch (err) {
    console.error('Groupinfo error:', err.message);
    await sock.sendMessage(jid, { text: '❌ Could not fetch group info.' });
  }
};
