module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage:\n`!hex <number>` — decimal to hex\n`!hex <hex> d` — hex to decimal' });
  if (args[1] === 'd') {
    const dec = parseInt(args[0], 16);
    if (isNaN(dec)) return sock.sendMessage(from, { text: '❌ Invalid hex value.' });
    await sock.sendMessage(from, { text: `💻 *Hex → Decimal*\n\n0x${args[0].toUpperCase()} = *${dec}*` });
  } else {
    const num = parseInt(args[0]);
    if (isNaN(num)) return sock.sendMessage(from, { text: '❌ Invalid number.' });
    await sock.sendMessage(from, { text: `💻 *Decimal → Hex*\n\n${num} = *0x${num.toString(16).toUpperCase()}*` });
  }
};
