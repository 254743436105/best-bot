const conversions = { 'km/h': 1, 'mph': 0.621371, 'm/s': 0.277778, 'knot': 0.539957 };
module.exports = async (sock, msg, args, from) => {
  if (args.length < 3) return sock.sendMessage(from, { text: '⚠️ Usage: `!speed <value> <from> <to>`\nUnits: km/h, mph, m/s, knot\nExample: `!speed 100 km/h mph`' });
  const val = parseFloat(args[0]), from_u = args[1].toLowerCase(), to_u = args[2].toLowerCase();
  if (isNaN(val) || !conversions[from_u] || !conversions[to_u]) return sock.sendMessage(from, { text: '❌ Invalid values or units.' });
  const result = (val / conversions[from_u] * conversions[to_u]).toFixed(4);
  await sock.sendMessage(from, { text: `🚀 *Speed Converter*\n\n${val} ${from_u} = *${result} ${to_u}*` });
};
