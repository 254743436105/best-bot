module.exports = async (sock, msg, args, from) => {
  const start = Date.now();
  await sock.sendMessage(from, { text: '🏓 Pong!' });
  const latency = Date.now() - start;
  await sock.sendMessage(from, {
    text: `✅ *Bot is alive!*\n⚡ Latency: *${latency}ms*\n🕐 Uptime: *${formatUptime(process.uptime())}*`,
  });
};

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ');
}
