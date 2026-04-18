module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!rate <name>`\nExample: `!rate John`' });
  const name = args.join(' ');
  let score = 0;
  for (let i = 0; i < name.length; i++) score += name.charCodeAt(i);
  score = score % 101;
  const bars = '█'.repeat(Math.floor(score/10)) + '░'.repeat(10 - Math.floor(score/10));
  await sock.sendMessage(from, { text: `⭐ *Rating: ${name}*\n\n${bars}\n\nScore: *${score}/100*` });
};
