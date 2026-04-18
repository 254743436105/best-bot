module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) return sock.sendMessage(from, { text: '⚠️ Usage: `!love <name1> <name2>`' });
  const [n1, ...rest] = args; const n2 = rest.join(' ');
  const combined = (n1+n2).toLowerCase();
  let score = 0; for (let i=0;i<combined.length;i++) score += combined.charCodeAt(i);
  score = score % 101;
  const hearts = '❤️'.repeat(Math.ceil(score/20));
  let msg2 = score>80?'💍 Soulmates!':score>60?'❤️ Great match!':score>40?'💕 Could work!':score>20?'🤔 Complicated!':'💔 Not meant to be!';
  await sock.sendMessage(from, { text: `❤️ *Love Calculator*\n━━━━━━━━━━━━━━━\n💑 ${n1} + ${n2}\n\n${hearts}\n\n💯 ${score}% Love\n${msg2}` });
};
