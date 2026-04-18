module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!decode <base64text>`' });
  try {
    const decoded = Buffer.from(args[0], 'base64').toString('utf8');
    await sock.sendMessage(from, { text: `🔓 *Base64 Decode*\n\nInput: ${args[0]}\nDecoded: ${decoded}` });
  } catch { await sock.sendMessage(from, { text: '❌ Invalid base64 string.' }); }
};
