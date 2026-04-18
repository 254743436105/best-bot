module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) return sock.sendMessage(from, { text: '⚠️ Usage: `!temp <value> <unit>`\nUnits: C, F, K\nExample: `!temp 100 C`' });
  const val = parseFloat(args[0]);
  const unit = args[1].toUpperCase();
  if (isNaN(val)) return sock.sendMessage(from, { text: '❌ Invalid temperature value.' });
  let c, f, k;
  if (unit === 'C') { c = val; f = (val * 9/5) + 32; k = val + 273.15; }
  else if (unit === 'F') { c = (val - 32) * 5/9; f = val; k = (val - 32) * 5/9 + 273.15; }
  else if (unit === 'K') { c = val - 273.15; f = (val - 273.15) * 9/5 + 32; k = val; }
  else return sock.sendMessage(from, { text: '❌ Use C, F, or K' });
  await sock.sendMessage(from, { text: `🌡️ *Temperature Converter*\n━━━━━━━━━━━━━━━\n🌡️ Celsius: *${c.toFixed(2)}°C*\n🌡️ Fahrenheit: *${f.toFixed(2)}°F*\n🌡️ Kelvin: *${k.toFixed(2)}K*` });
};
