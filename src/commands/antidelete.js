const { isEnabled, setEnabled } = require('../handlers/antideleteHandler');

module.exports = async (sock, msg, args, from) => {
  const sub = (args[0] || '').toLowerCase();

  if (sub === 'on') {
    setEnabled(true);
    return sock.sendMessage(from, {
      text: '🛡️ *Anti-Delete ON!*\n\nI will now reveal any deleted messages in this chat. 👀',
    });
  }

  if (sub === 'off') {
    setEnabled(false);
    return sock.sendMessage(from, {
      text: '🛡️ *Anti-Delete OFF.*\n\nDeleted messages will no longer be revealed.',
    });
  }

  const current = isEnabled();
  await sock.sendMessage(from, {
    text: `🛡️ *Anti-Delete*\n\nStatus: *${current ? 'ON ✅' : 'OFF ❌'}*\n\nCommands:\n• \`!antidelete on\` — Reveal deleted messages\n• \`!antidelete off\` — Stop revealing`,
  });
};
