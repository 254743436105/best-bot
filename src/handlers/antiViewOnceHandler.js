const viewOnceEnabled = {};

async function handleAntiViewOnce(sock, msg) {
  const jid = msg.key.remoteJid;
  if (viewOnceEnabled[jid] === false) return;

  const m = msg.message;
  if (!m) return;

  const viewOnceMsg =
    m.viewOnceMessage?.message ||
    m.viewOnceMessageV2?.message ||
    m.viewOnceMessageV2Extension?.message;

  if (!viewOnceMsg) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.split('@')[0];

  // Send to YOUR number's private chat
  const myJid = sock.user.id.replace(/:\d+/, '') + '';

  try {
    if (viewOnceMsg.imageMessage) {
      await sock.sendMessage(myJid, {
        image: { url: viewOnceMsg.imageMessage.url },
        mimetype: viewOnceMsg.imageMessage.mimetype,
        caption: `👁️ *Anti View-Once*\nFrom: @${senderNum}`,
        mentions: [sender],
      });
    }
    if (viewOnceMsg.videoMessage) {
      await sock.sendMessage(myJid, {
        video: { url: viewOnceMsg.videoMessage.url },
        mimetype: viewOnceMsg.videoMessage.mimetype,
        caption: `👁️ *Anti View-Once*\nFrom: @${senderNum}`,
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
  return viewOnceEnabled[jid] !== false;
}

module.exports = { handleAntiViewOnce, setAntiViewOnce, isAntiViewOnceEnabled };
