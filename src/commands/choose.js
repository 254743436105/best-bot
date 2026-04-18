module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) return sock.sendMessage(from, { text: '⚠️ Usage: `!choose <option1> | <option2> | ...`\nExample: `!choose pizza | burger | tacos`' });
  const options = args.join(' ').split('|').map(o => o.trim()).filter(Boolean);
  if (options.length < 2) return sock.sendMessage(from, { text: '❌ Separate options with `|`' });
  const choice = options[Math.floor(Math.random() * options.length)];
  await sock.sendMessage(from, { text: `🤔 *I Choose...*\n\n*${choice}* ✅\n\n_From: ${options.join(', ')}_` });
};
