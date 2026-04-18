module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) return sock.sendMessage(from, { text: '⚠️ Usage: `!percentage <value> <total>`\nExample: `!percentage 45 200`' });
  const val = parseFloat(args[0]), total = parseFloat(args[1]);
  if (isNaN(val) || isNaN(total) || total === 0) return sock.sendMessage(from, { text: '❌ Invalid numbers.' });
  const pct = ((val / total) * 100).toFixed(2);
  await sock.sendMessage(from, { text: `📊 *Percentage*\n\n${val} out of ${total} = *${pct}%*` });
};
