const conversions = { m: 1, km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, ft: 3.28084, in: 39.3701, yd: 1.09361 };
module.exports = async (sock, msg, args, from) => {
  if (args.length < 3) return sock.sendMessage(from, { text: '⚠️ Usage: `!length <value> <from> <to>`\nUnits: m, km, cm, mm, mi, ft, in, yd\nExample: `!length 5 km mi`' });
  const val = parseFloat(args[0]), from_u = args[1].toLowerCase(), to_u = args[2].toLowerCase();
  if (isNaN(val) || !conversions[from_u] || !conversions[to_u]) return sock.sendMessage(from, { text: '❌ Invalid values or units.' });
  const result = (val / conversions[from_u] * conversions[to_u]).toFixed(4);
  await sock.sendMessage(from, { text: `📏 *Length Converter*\n\n${val} ${from_u} = *${result} ${to_u}*` });
};
