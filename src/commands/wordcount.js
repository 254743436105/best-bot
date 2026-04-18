module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!wordcount <text>`' });
  const text = args.join(' ');
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  await sock.sendMessage(from, { text: `📊 *Word Count*\n━━━━━━━━━━━━━━━\n📝 Words: *${words}*\n🔤 Characters: *${chars}*\n🔤 Chars (no spaces): *${charsNoSpace}*` });
};
