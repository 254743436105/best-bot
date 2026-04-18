const conversions = { kg: 1, g: 1000, lb: 2.20462, oz: 35.274, t: 0.001, mg: 1000000 };
module.exports = async (sock, msg, args, from) => {
  if (args.length < 3) return sock.sendMessage(from, { text: '⚠️ Usage: `!weight <value> <from> <to>`\nUnits: kg, g, lb, oz, t, mg\nExample: `!weight 70 kg lb`' });
  const val = parseFloat(args[0]), from_u = args[1].toLowerCase(), to_u = args[2].toLowerCase();
  if (isNaN(val) || !conversions[from_u] || !conversions[to_u]) return sock.sendMessage(from, { text: '❌ Invalid values or units.' });
  const result = (val / conversions[from_u] * conversions[to_u]).toFixed(4);
  await sock.sendMessage(from, { text: `⚖️ *Weight Converter*\n\n${val} ${from_u} = *${result} ${to_u}*` });
};
