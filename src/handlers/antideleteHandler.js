const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// In-memory cache: messageId -> { msg, jid }
const cache = new Map();
const MAX_CACHE = 500;

function cacheMessage(msg) {
  if (!msg?.key?.id || !msg.message) return;
  if (cache.size >= MAX_CACHE) {
    // evict oldest
    cache.delete(cache.keys().next().value);
  }
  cache.set(msg.key.id, {
    msg,
    jid: msg.key.remoteJid,
    timestamp: Date.now(),
  });
}

async function handleDelete(sock, updates) {
  for (const update of updates) {
    const id = update.key?.id;
    if (!id) continue;

    const cached = cache.get(id);
    if (!cached) continue;

    const { msg, jid } = cached;
    cache.delete(id);

    try {
      const type = Object.keys(msg.message || {})[0];
      const sender = msg.key.participant || msg.key.remoteJid;
      const senderNum = sender.split('@')[0];

      let text = `🚨 *Deleted message from @${senderNum}:*\n\n`;

      if (type === 'conversation' || type === 'extendedTextMessage') {
        const body =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          '';
        await sock.sendMessage(jid, {
          text: text + body,
          mentions: [sender],
        });
      } else if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'].includes(type)) {
        const buffer = await downloadMediaMessage(msg, 'buffer', {});
        const mimetype = msg.message[type]?.mimetype || 'application/octet-stream';
        const caption  = msg.message[type]?.caption || '';

        await sock.sendMessage(jid, {
          [type === 'imageMessage' ? 'image'
            : type === 'videoMessage' ? 'video'
            : type === 'audioMessage' ? 'audio'
            : 'sticker']: buffer,
          mimetype,
          caption: text + caption,
          mentions: [sender],
        });
      } else {
        await sock.sendMessage(jid, {
          text: text + `[${type}]`,
          mentions: [sender],
        });
      }
    } catch (e) {
      console.error('antidelete error:', e);
    }
  }
}

module.exports = { cacheMessage, handleDelete };
