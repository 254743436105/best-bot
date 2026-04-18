module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!spell <word>`' });
  const word = args[0];
  const spelt = word.toUpperCase().split('').join(' - ');
  await sock.sendMessage(from, { text: `🔤 *Spelling: "${word}"*\n\n${spelt}` });
};
