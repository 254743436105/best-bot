module.exports = async (sock, msg, args, from) => {
  const result = Math.random() < 0.5 ? 'HEADS 🪙' : 'TAILS 🪙';
  await sock.sendMessage(from, { text: `🪙 *Coin Flip*\n\nResult: *${result}*` });
};
