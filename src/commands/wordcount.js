module.exports = async (sock, msg, args, jid) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: `!wordcount <text>`' });
  const text = args.join(' ');
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  await sock.sendMessage(jid, { text: `📊 *Word Count*\n━━━━━━━━━━━━━━━\n📝 Words: *${words}*\n🔤 Characters: *${chars}*\n🔤 Chars (no spaces): *${charsNoSpace}*` });
};
