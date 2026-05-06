module.exports = async (sock, msg, args, jid) => {
  if (args.length < 2) return sock.sendMessage(jid, { text: '⚠️ Usage: `!choose <option1> | <option2> | ...`\nExample: `!choose pizza | burger | tacos`' });
  const options = args.join(' ').split('|').map(o => o.trim()).filter(Boolean);
  if (options.length < 2) return sock.sendMessage(jid, { text: '❌ Separate options with `|`' });
  const choice = options[Math.floor(Math.random() * options.length)];
  await sock.sendMessage(jid, { text: `🤔 *I Choose...*\n\n*${choice}* ✅\n\n_From: ${options.join(', ')}_` });
};
