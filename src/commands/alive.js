module.exports = async (sock, msg, args, from) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  await sock.sendMessage(from, {
    text: `🤖 *Bot Status*\n━━━━━━━━━━━━━━━\n✅ I am alive and running!\n⏱️ Uptime: *${h}h ${m}m ${s}s*\n🚀 Platform: Heroku\n💾 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n📡 Status: Connected\n━━━━━━━━━━━━━━━\nSend *!help* for all commands 💪`,
  });
};
