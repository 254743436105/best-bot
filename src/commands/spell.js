module.exports = async (sock, msg, args, jid) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: `!spell <word>`' });
  const word = args[0];
  const spelt = word.toUpperCase().split('').join(' - ');
  await sock.sendMessage(jid, { text: `🔤 *Spelling: "${word}"*\n\n${spelt}` });
};
