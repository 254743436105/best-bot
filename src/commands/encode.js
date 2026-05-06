module.exports = async (sock, msg, args, jid) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: `!encode <text>`' });
  const text = args.join(' ');
  const b64 = Buffer.from(text).toString('base64');
  await sock.sendMessage(jid, { text: `🔒 *Base64 Encode*\n\nInput: ${text}\nEncoded:\n\`${b64}\`` });
};
