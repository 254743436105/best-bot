const { isEnabled, setEnabled } = require('../handlers/statusHandler');

module.exports = async (sock, msg, args, from) => {
  const sub = (args[0] || '').toLowerCase();

  if (sub === 'on') {
    setEnabled(true);
    return sock.sendMessage(from, { text: '👁️ Auto status view: *ON*\nI will automatically view all your contacts\' statuses.' });
  }

  if (sub === 'off') {
    setEnabled(false);
    return sock.sendMessage(from, { text: '🙈 Auto status view: *OFF*\nI will no longer auto-view statuses.' });
  }

  const current = isEnabled();
  await sock.sendMessage(from, {
    text: `👁️ *Auto Status View*\n\nStatus: *${current ? 'ON ✅' : 'OFF ❌'}*\n\nCommands:\n• \`!statusview on\` — Enable\n• \`!statusview off\` — Disable`,
  });
};
