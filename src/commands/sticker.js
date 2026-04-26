const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function execute(sock, msg, args, jid) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted?.imageMessage) {
    return sock.sendMessage(jid, { text: '⚠️ Reply to an image with *!sticker* to convert it.' });
  }

  try {
    // Reconstruct a minimal message object to download from
    const fakeMsg = {
      key: { ...msg.key },
      message: quoted,
    };

    const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});

    await sock.sendMessage(jid, {
      sticker: buffer,
    });
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Failed to create sticker: ${e.message}` });
  }
}

module.exports = { execute };
