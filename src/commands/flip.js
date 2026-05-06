module.exports = async (sock, msg, args, jid) => {
  const result = Math.random() < 0.5 ? 'HEADS 🪙' : 'TAILS 🪙';
  await sock.sendMessage(jid, { text: `🪙 *Coin Flip*\n\nResult: *${result}*` });
};
