module.exports = async (sock, msg, args, from) => {
  const sides = parseInt(args[0]) || 6;
  if (sides < 2 || sides > 1000) return sock.sendMessage(from, { text: '❌ Sides must be between 2 and 1000' });
  const result = Math.floor(Math.random() * sides) + 1;
  await sock.sendMessage(from, { text: `🎲 *Dice Roll (d${sides})*\n\nResult: *${result}*` });
};
