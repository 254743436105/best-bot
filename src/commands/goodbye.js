const goodbyeEnabled = {}; // groupJid -> true/false

async function execute(sock, msg, args, jid) {
  const toggle = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(toggle)) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !goodbye on | off' });
  }
  goodbyeEnabled[jid] = toggle === 'on';
  await sock.sendMessage(jid, { text: `👋 Goodbye messages are now *${toggle.toUpperCase()}*` });
}

module.exports = { execute, goodbyeEnabled };
