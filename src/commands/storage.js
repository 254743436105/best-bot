const conversions = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 };
module.exports = async (sock, msg, args, from) => {
  if (args.length < 3) return sock.sendMessage(from, { text: '⚠️ Usage: `!storage <value> <from> <to>`\nUnits: B, KB, MB, GB, TB\nExample: `!storage 1 GB MB`' });
  const val = parseFloat(args[0]), from_u = args[1].toUpperCase(), to_u = args[2].toUpperCase();
  if (isNaN(val) || !conversions[from_u] || !conversions[to_u]) return sock.sendMessage(from, { text: '❌ Invalid values or units.' });
  const result = (val * conversions[from_u] / conversions[to_u]).toFixed(4);
  await sock.sendMessage(from, { text: `💾 *Storage Converter*\n\n${val} ${from_u} = *${result} ${to_u}*` });
};
