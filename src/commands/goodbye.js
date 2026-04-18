let goodbyeEnabled = {};
module.exports = async (sock, msg, args, from) => {
  if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });
  const sub = (args[0] || '').toLowerCase();
  if (sub === 'on') { goodbyeEnabled[from] = true; return sock.sendMessage(from, { text: '👋 *Goodbye messages ON!*' }); }
  if (sub === 'off') { goodbyeEnabled[from] = false; return sock.sendMessage(from, { text: '👋 *Goodbye messages OFF.*' }); }
  await sock.sendMessage(from, { text: `👋 *Goodbye Messages*\nStatus: *${goodbyeEnabled[from] ? 'ON ✅' : 'OFF ❌'}*\n\n• \`!goodbye on\`\n• \`!goodbye off\`` });
};
module.exports.goodbyeEnabled = goodbyeEnabled;
