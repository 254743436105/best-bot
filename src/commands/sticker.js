const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = async (sock, msg, args, from) => {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

  if (!imageMsg) {
    return sock.sendMessage(from, {
      text: '⚠️ Please reply to an image with `!sticker` to convert it to a sticker.',
    });
  }

  try {
    await sock.sendMessage(from, { text: '🎨 Converting to sticker...' });

    // Build a fake message object so downloadMediaMessage can fetch it
    const targetMsg = quoted
      ? {
          key: msg.message.extendedTextMessage.contextInfo.stanzaId
            ? { ...msg.key, id: msg.message.extendedTextMessage.contextInfo.stanzaId }
            : msg.key,
          message: quoted,
        }
      : msg;

    const buffer = await downloadMediaMessage(targetMsg, 'buffer', {});

    await sock.sendMessage(from, {
      sticker: buffer,
    });
  } catch (err) {
    console.error('Sticker error:', err.message);
    await sock.sendMessage(from, { text: '❌ Failed to create sticker. Make sure you reply to an image.' });
  }
};
