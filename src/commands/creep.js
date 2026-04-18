module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!creep <name>`' });
  const name = args.join(' ');
  let score = 0; for (let i=0;i<name.length;i++) score += name.charCodeAt(i);
  score = score % 101;
  const level = score > 80 ? '🚨 EXTREME' : score > 60 ? '😱 HIGH' : score > 40 ? '👀 MEDIUM' : score > 20 ? '🤔 LOW' : '😇 NONE';
  await sock.sendMessage(from, { text: `👀 *Creep Meter: ${name}*\n\n${score}/100\nLevel: *${level}*\n\n_Just for fun! 😂_` });
};
