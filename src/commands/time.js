module.exports = async (sock, msg, args, from) => {
  const tz = process.env.TIMEZONE || 'Africa/Nairobi';
  const now = new Date();

  const dateStr = now.toLocaleDateString('en-KE', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = now.toLocaleTimeString('en-KE', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  await sock.sendMessage(from, {
    text: `🕐 *Current Time*\n\n📅 ${dateStr}\n⏰ ${timeStr}\n🌍 Timezone: ${tz}`,
  });
};
