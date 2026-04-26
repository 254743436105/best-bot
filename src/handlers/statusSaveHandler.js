const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const INBOX_DIR = path.join(__dirname, '../data/status_inbox');

async function handleStatusSave(sock, msg) {
  try {
    const type = Object.keys(msg.message || {})[0];
    if (!['imageMessage', 'videoMessage'].includes(type)) return;

    fs.mkdirSync(INBOX_DIR, { recursive: true });

    const buffer = await downloadMediaMessage(msg, 'buffer', {});
    const ext    = type === 'imageMessage' ? 'jpg' : 'mp4';
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];
    const file   = path.join(INBOX_DIR, `${sender}_${Date.now()}.${ext}`);

    fs.writeFileSync(file, buffer);
    console.log(`📥 Saved status from ${sender} → ${file}`);
  } catch (e) {
    // non-fatal — status may have expired or be text-only
  }
}

module.exports = { handleStatusSave };
