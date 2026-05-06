async function execute(sock, msg, args, jid) {
  const start = Date.now();
  await sock.sendMessage(jid, { text: '🏓 Pong! ...' });
  const latency = Date.now() - start;
  await sock.sendMessage(jid, { text: `🏓 *Pong!* Response time: *${latency}ms*` });
}

module.exports = { execute };
