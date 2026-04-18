const { downloadMediaMessage } = require('@whiskeysockets/baileys');

let statusSaveEnabled = false;
let ownerJid = null; // bot's own number — statuses get forwarded here
const savedStatuses = [];

function setEnabled(val, jid) {
  statusSaveEnabled = val;
  if (jid) ownerJid = jid;
}
function isEnabled() { return statusSaveEnabled; }
function getSaved() { return savedStatuses; }

async function handleStatusSave(sock, msg) {
  if (!statusSaveEnabled) return;
  if (msg.key?.remoteJid !== 'status@broadcast') return;
  if (msg.key?.fromMe) return;

  const participant = msg.key?.participant;
  if (!participant) return;
  const senderNum = participant.split('@')[0];

  const timestamp = new Date().toLocaleString('en-KE', {
    timeZone: process.env.TIMEZONE || 'Africa/Nairobi',
  });

  try {
    const imageMsg = msg.message?.imageMessage;
    const videoMsg = msg.message?.videoMessage;
    const textMsg  = msg.message?.conversation ||
                     msg.message?.extendedTextMessage?.text;

    // Determine inbox target — use owner's JID or fallback to sender
    const inboxJid = ownerJid || (sock.user.id.split(':')[0] + '@s.whatsapp.net');

    if (imageMsg) {
      const buffer = await downloadMediaMessage(msg, 'buffer', {});
      await sock.sendMessage(inboxJid, {
        image: buffer,
        caption: `📸 *Auto-Saved Status*\n👤 From: +${senderNum}\n🕐 ${timestamp}${imageMsg.caption ? `\n💬 ${imageMsg.caption}` : ''}`,
      });
      savedStatuses.push({ sender: senderNum, type: 'image', timestamp, caption: imageMsg.caption || '' });

    } else if (videoMsg) {
      const buffer = await downloadMediaMessage(msg, 'buffer', {});
      await sock.sendMessage(inboxJid, {
        video: buffer,
        caption: `🎬 *Auto-Saved Status*\n👤 From: +${senderNum}\n🕐 ${timestamp}${videoMsg.caption ? `\n💬 ${videoMsg.caption}` : ''}`,
        mimetype: 'video/mp4',
      });
      savedStatuses.push({ sender: senderNum, type: 'video', timestamp, caption: videoMsg.caption || '' });

    } else if (textMsg) {
      await sock.sendMessage(inboxJid, {
        text: `📝 *Auto-Saved Status*\n👤 From: +${senderNum}\n🕐 ${timestamp}\n━━━━━━━━━━━━━━━\n${textMsg}`,
      });
      savedStatuses.push({ sender: senderNum, type: 'text', timestamp, caption: textMsg });
    }

    // Keep last 100
    if (savedStatuses.length > 100) savedStatuses.shift();
    console.log(`💾 Auto-saved status from ${senderNum}`);

  } catch (err) {
    console.error('Status save error:', err.message);
  }
}

module.exports = { setEnabled, isEnabled, getSaved, handleStatusSave };
