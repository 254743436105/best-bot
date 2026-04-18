module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage:\n`!binary <number>` — decimal to binary\n`!binary <binary> d` — binary to decimal' });
  if (args[1] === 'd') {
    const dec = parseInt(args[0], 2);
    if (isNaN(dec)) return sock.sendMessage(from, { text: '❌ Invalid binary number.' });
    await sock.sendMessage(from, { text: `💻 *Binary → Decimal*\n\n${args[0]} = *${dec}*` });
  } else {
    const num = parseInt(args[0]);
    if (isNaN(num)) return sock.sendMessage(from, { text: '❌ Invalid number.' });
    await sock.sendMessage(from, { text: `💻 *Decimal → Binary*\n\n${num} = *${num.toString(2)}*` });
  }
};
