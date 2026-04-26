// Auto-view status updates
const statusViewEnabled = {}; // jid -> true/false  (toggled by !statusview command)

async function handleStatus(sock, msg) {
  try {
    // Read the status so the sender sees the "seen" tick
    await sock.readMessages([msg.key]);
  } catch (e) {
    // non-fatal
  }
}

module.exports = { handleStatus, statusViewEnabled };
