async function execute(sock, msg, args, jid) {
  const tz = process.env.TIMEZONE || 'Africa/Nairobi';
  const now = new Date().toLocaleString('en-KE', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' });
  await sock.sendMessage(jid, { text: `🕐 *Current Time*\n\n${now}` });
}

module.exports = { execute };
