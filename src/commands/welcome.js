const welcomeEnabled = {}; // groupJid -> true/false

async function execute(sock, msg, args, jid) {
  const toggle = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(toggle)) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !welcome on | off' });
  }
  welcomeEnabled[jid] = toggle === 'on';
  await sock.sendMessage(jid, { text: `👋 Welcome messages are now *${toggle.toUpperCase()}*` });
}

module.exports = { execute, welcomeEnabled };
