/**
 * antideleteHandler.js
 * Saves messages before they are deleted and resends them.
 */

let antideleteEnabled = false;
const messageCache = new Map(); // cache messages by key

function setEnabled(val) { antideleteEnabled = val; }
function isEnabled() { return antideleteEnabled; }

// Cache every incoming message
function cacheMessage(msg) {
  if (!antideleteEnabled) return;
  if (!msg.message || msg.key.fromMe) return;
  const key = `${msg.key.remoteJid}_${msg.key.id}`;
  messageCache.set(key, {
    msg,
    timestamp: Date.now(),
  });

  // Keep cache clean — delete messages older than 10 minutes
  for (const [k, v] of messageCache.entries()) {
    if (Date.now() - v.timestamp > 600000) messageCache.delete(k);
  }
}

// When a message is deleted, resend it
async function handleDelete(sock, update) {
  if (!antideleteEnabled) return;

  try {
    for (const key of update.keys) {
      const cacheKey = `${key.remoteJid}_${key.id}`;
      const cached = messageCache.get(cacheKey);
      if (!cached) continue;

      const { msg } = cached;
      const from = key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const senderNum = sender.split('@')[0];

      // Get message content
      const content =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || null;

      const isMedia = msg.message?.imageMessage || msg.message?.videoMessage ||
        msg.message?.audioMessage || msg.message?.stickerMessage ||
        msg.message?.documentMessage;

      await sock.sendMessage(from, {
        text: `🗑️ *Deleted Message Alert!*\n👤 From: @${senderNum}${content ? `\n💬 Message: ${content}` : isMedia ? '\n📎 Media was deleted' : ''}`,
        mentions: [sender],
      });

      messageCache.delete(cacheKey);
    }
  } catch (err) {
    console.error('Antidelete error:', err.message);
  }
}

module.exports = { setEnabled, isEnabled, cacheMessage, handleDelete };
