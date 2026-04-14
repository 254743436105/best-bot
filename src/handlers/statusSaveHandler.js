/**
 * statusSaveHandler.js
 * Automatically saves WhatsApp statuses (photos/videos/text) sent by contacts.
 */

let statusSaveEnabled = false;
const savedStatuses = []; // in-memory store

function setEnabled(val) { statusSaveEnabled = val; }
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
    const textMsg = msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text;

    if (imageMsg || videoMsg || textMsg) {
      savedStatuses.push({
        sender: senderNum,
        type: imageMsg ? 'image' : videoMsg ? 'video' : 'text',
        caption: imageMsg?.caption || videoMsg?.caption || textMsg || '',
        timestamp,
        msg,
      });

      // Keep only last 50 statuses
      if (savedStatuses.length > 50) savedStatuses.shift();

      console.log(`💾 Saved status from ${senderNum}`);
    }
  } catch (err) {
    console.error('Status save error:', err.message);
  }
}

module.exports = { setEnabled, isEnabled, getSaved, handleStatusSave };
