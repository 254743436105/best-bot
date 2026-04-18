const crypto = require('crypto');
module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!hash <text>`\nExample: `!hash hello world`' });
  const text = args.join(' ');
  const md5 = crypto.createHash('md5').update(text).digest('hex');
  const sha1 = crypto.createHash('sha1').update(text).digest('hex');
  const sha256 = crypto.createHash('sha256').update(text).digest('hex');
  await sock.sendMessage(from, { text: `#️⃣ *Hash Generator*\n━━━━━━━━━━━━━━━\n📝 Input: ${text}\n\nMD5:\n\`${md5}\`\n\nSHA1:\n\`${sha1}\`\n\nSHA256:\n\`${sha256}\`` });
};
