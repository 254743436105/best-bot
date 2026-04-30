// src/commands/qr.js
const qrcode = require('qrcode-terminal');

async function execute(sock, msg, args, jid) {
  await sock.sendMessage(jid, {
    text: `📱 *Session QR Info*\n\nTo get a new QR code:\n1. Clear SESSION_DATA in Heroku/Render\n2. Restart the bot\n3. Check logs for QR code\n4. Scan with WhatsApp → Linked Devices\n\n⚠️ QR codes can only be shown in the terminal/logs, not in WhatsApp chat for security reasons.`
  });
}
module.exports = { execute };
