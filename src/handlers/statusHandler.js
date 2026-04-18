/**
 * statusHandler.js
 *
 * Automatically views WhatsApp statuses posted by your contacts.
 * This only works for your own account (the bot's linked number).
 * Statuses are viewed silently — no message is sent to the contact.
 */

let autoViewEnabled = true; // Toggle via !statusview command

function isEnabled() {
  return autoViewEnabled;
}

function setEnabled(val) {
  autoViewEnabled = val;
}

/**
 * Call this inside sock.ev.on('messages.upsert') for status JIDs.
 * Baileys surfaces statuses as messages from 'status@broadcast'.
 */
async function handleStatus(sock, msg) {
  if (!autoViewEnabled) return;

  const from = msg.key?.remoteJid;
  if (from !== 'status@broadcast') return;

  // Don't view your own status
  if (msg.key?.fromMe) return;

  const participant = msg.key?.participant;
  if (!participant) return;

  try {
    await sock.readMessages([msg.key]);
    console.log(`👁️  Auto-viewed status from ${participant}`);
  } catch (err) {
    // Silently ignore — statuses may expire or fail
  }
}

module.exports = { handleStatus, isEnabled, setEnabled };
