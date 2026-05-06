const afkUsers = new Map();
module.exports = async (sock, msg, args, jid) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const reason = args.join(' ') || 'No reason given';
  afkUsers.set(sender, { reason, time: Date.now() });
  await sock.sendMessage(jid, { text: `💤 *AFK Mode ON*\n\nReason: _${reason}_\n\nI'll let people know you're away when they mention you.` });
};
module.exports.afkUsers = afkUsers;
