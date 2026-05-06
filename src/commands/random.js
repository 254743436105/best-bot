module.exports = async (sock, msg, args, jid) => {
  if (args.length < 2) return sock.sendMessage(jid, { text: '⚠️ Usage: `!random <min> <max>`\nExample: `!random 1 100`' });
  const min = parseInt(args[0]), max = parseInt(args[1]);
  if (isNaN(min) || isNaN(max)) return sock.sendMessage(jid, { text: '❌ Please enter valid numbers.' });
  const result = Math.floor(Math.random() * (max - min + 1)) + min;
  await sock.sendMessage(jid, { text: `🎯 *Random Number*\n\nBetween ${min} and ${max}: *${result}*` });
};
