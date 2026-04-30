// src/handlers/antiViewOnceHandler.js
// Intercepts view-once messages and forwards them to the recipient privately

const viewOnceEnabled = {}; // { jid: true/false }

async function handleAntiViewOnce(sock, msg) {
  const jid = msg.key.remoteJid;

  // Only process if anti-view-once is enabled for this chat (or globally)
  // Default: enabled for all chats
  if (viewOnceEnabled[jid] === false) return;

  const m = msg.message;
  if (!m) return;

  // Detect view-once message types
  const viewOnceMsg =
    m.viewOnceMessage?.message ||
    m.viewOnceMessageV2?.message ||
    m.viewOnceMessageV2Extension?.message ||
    m.ephemeralMessage?.message?.viewOnceMessage?.message;

  if (!viewOnceMsg) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.split('@')[0];
  const groupName = jid.endsWith('@g.us') ? `group` : `DM`;

  try {
    // Image view-once
    if (viewOnceMsg.imageMessage) {
      const img = viewOnceMsg.imageMessage;
      await sock.sendMessage(sock.user.id, {
        image: { url: img.url },
        mimetype: img.mimetype,
        caption: `👁️ *Anti View-Once*\n📍 From: @${senderNum} (${groupName})\n\n_${img.caption || 'No caption'}_`,
        mentions: [sender],
      });
    }

    // Video view-once
    if (viewOnceMsg.videoMessage) {
      const vid = viewOnceMsg.videoMessage;
      await sock.sendMessage(sock.user.id, {
        video: { url: vid.url },
        mimetype: vid.mimetype,
        caption: `👁️ *Anti View-Once*\n📍 From: @${senderNum} (${groupName})\n\n_${vid.caption || 'No caption'}_`,
        mentions: [sender],
      });
    }

    // Audio view-once
    if (viewOnceMsg.audioMessage) {
      const aud = viewOnceMsg.audioMessage;
      await sock.sendMessage(sock.user.id, {
        audio: { url: aud.url },
        mimetype: aud.mimetype,
        ptt: aud.ptt,
      });
      await sock.sendMessage(sock.user.id, {
        text: `👁️ *Anti View-Once Audio*\n📍 From: @${senderNum} (${groupName})`,
        mentions: [sender],
      });
    }

    console.log(`👁️ Anti-ViewOnce triggered from ${senderNum}`);
  } catch (err) {
    console.error('antiViewOnce error:', err.message);
  }
}

function setAntiViewOnce(jid, enabled) {
  viewOnceEnabled[jid] = enabled;
}

function isAntiViewOnceEnabled(jid) {
  return viewOnceEnabled[jid] !== false; // default ON
}

module.exports = { handleAntiViewOnce, setAntiViewOnce, isAntiViewOnceEnabled };
