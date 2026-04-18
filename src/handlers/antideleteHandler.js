let antideleteEnabled = false;
const messageCache = new Map();

function setEnabled(val) { antideleteEnabled = val; }
function isEnabled() { return antideleteEnabled; }

function cacheMessage(msg) {
  if (!msg?.message) return;
  try {
    const key = `${msg.key.remoteJid}_${msg.key.id}`;
    messageCache.set(key, { msg, timestamp: Date.now() });

    // Clean cache older than 10 minutes
    for (const [k, v] of messageCache.entries()) {
      if (Date.now() - v.timestamp > 600000) messageCache.delete(k);
    }
  } catch (e) {}
}

async function handleDelete(sock, updates) {
  if (!antideleteEnabled) return;

  for (const update of updates) {
    try {
      const key = update.key;
      if (!key) continue;

      const cacheKey = `${key.remoteJid}_${key.id}`;
      const cached = messageCache.get(cacheKey);
      if (!cached) continue;

      const { msg } = cached;
      const from = key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const senderNum = sender.split('@')[0];

      const content =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || '';

      const hasMedia = !!(
        msg.message?.imageMessage ||
        msg.message?.videoMessage ||
        msg.message?.audioMessage ||
        msg.message?.stickerMessage ||
        msg.message?.documentMessage
      );

      let replyText = `🗑️ *Anti-Delete Alert!*\n👤 From: @${senderNum}\n`;
      if (content) replyText += `💬 *Message:* ${content}`;
      else if (hasMedia) replyText += `📎 _(Media message was deleted)_`;
      else replyText += `_(Message content unavailable)_`;

      await sock.sendMessage(from, {
        text: replyText,
        mentions: [sender],
      });

      messageCache.delete(cacheKey);
    } catch (err) {
      console.error('Antidelete error:', err.message);
    }
  }
}

module.exports = { setEnabled, isEnabled, cacheMessage, handleDelete };
