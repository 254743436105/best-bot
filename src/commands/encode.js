module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!encode <text>`' });
  const text = args.join(' ');
  const b64 = Buffer.from(text).toString('base64');
  await sock.sendMessage(from, { text: `🔒 *Base64 Encode*\n\nInput: ${text}\nEncoded:\n\`${b64}\`` });
};
