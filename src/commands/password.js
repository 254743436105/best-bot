module.exports = async (sock, msg, args, from) => {
  const length = Math.min(parseInt(args[0]) || 12, 64);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) password += chars[Math.floor(Math.random() * chars.length)];
  await sock.sendMessage(from, { text: `🔐 *Password Generator*\n\n\`${password}\`\n\n_Length: ${length} characters_\n⚠️ Don't share this with anyone!` });
};
