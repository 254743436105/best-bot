module.exports = async (sock, msg, args, jid) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: `!reverse <text>`' });
  const text = args.join(' ');
  const reversed = text.split('').reverse().join('');
  await sock.sendMessage(jid, { text: `🔄 *Reversed*\n\nOriginal: ${text}\nReversed: ${reversed}` });
};
