const { statusViewEnabled } = require('../handlers/statusHandler');

async function execute(sock, msg, args, jid) {
  const toggle = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(toggle)) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !statusview on | off' });
  }

  statusViewEnabled[jid] = toggle === 'on';
  await sock.sendMessage(jid, {
    text: `👁️ Auto status view is now *${toggle.toUpperCase()}*`,
  });
}

module.exports = { execute };
