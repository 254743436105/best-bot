let welcomeEnabled = {};
module.exports = async (sock, msg, args, from) => {
  if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });
  const sub = (args[0] || '').toLowerCase();
  if (sub === 'on') { welcomeEnabled[from] = true; return sock.sendMessage(from, { text: '👋 *Welcome messages ON!*\nNew members will be welcomed automatically.' }); }
  if (sub === 'off') { welcomeEnabled[from] = false; return sock.sendMessage(from, { text: '👋 *Welcome messages OFF.*' }); }
  await sock.sendMessage(from, { text: `👋 *Welcome Messages*\nStatus: *${welcomeEnabled[from] ? 'ON ✅' : 'OFF ❌'}*\n\n• \`!welcome on\` — Enable\n• \`!welcome off\` — Disable` });
};
module.exports.welcomeEnabled = welcomeEnabled;
