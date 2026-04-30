// src/commands/presence.js
async function execute(sock, msg, args, jid) {
  const type = args[0]?.toLowerCase();

  if (!type || !['typing', 'recording', 'online', 'offline'].includes(type)) {
    return sock.sendMessage(jid, { text: '👤 Usage: !presence typing | recording | online | offline' });
  }

  try {
    const presenceMap = {
      typing: 'composing',
      recording: 'recording',
      online: 'available',
      offline: 'unavailable',
    };

    await sock.sendPresenceUpdate(presenceMap[type], jid);

    // Auto-reset after 5 seconds
    if (type === 'typing' || type === 'recording') {
      setTimeout(() => sock.sendPresenceUpdate('paused', jid), 5000);
    }

    await sock.sendMessage(jid, { text: `✅ Presence set to *${type}* for 5 seconds` });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Failed to set presence.' });
  }
}
module.exports = { execute };
