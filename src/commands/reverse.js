module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!reverse <text>`' });
  const text = args.join(' ');
  const reversed = text.split('').reverse().join('');
  await sock.sendMessage(from, { text: `🔄 *Reversed*\n\nOriginal: ${text}\nReversed: ${reversed}` });
};
