module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) {
    return sock.sendMessage(from, {
      text: '💕 Usage: `!ship <name1> <name2>`\nExample: `!ship John Jane`',
    });
  }

  const name1 = args[0];
  const name2 = args.slice(1).join(' ');

  // Generate consistent score based on names
  const combined = (name1 + name2).toLowerCase();
  let score = 0;
  for (let i = 0; i < combined.length; i++) score += combined.charCodeAt(i);
  score = score % 101;

  let emoji, verdict;
  if (score >= 90) { emoji = '💍'; verdict = 'Soulmates! Perfect match!'; }
  else if (score >= 75) { emoji = '❤️'; verdict = 'Great match! Strong connection!'; }
  else if (score >= 60) { emoji = '💕'; verdict = 'Good compatibility!'; }
  else if (score >= 45) { emoji = '😊'; verdict = 'Could work with some effort!'; }
  else if (score >= 30) { emoji = '🤔'; verdict = 'Hmm... it\'s complicated!'; }
  else { emoji = '💔'; verdict = 'Not the best match...'; }

  const bar = '❤️'.repeat(Math.floor(score / 10)) + '🖤'.repeat(10 - Math.floor(score / 10));

  await sock.sendMessage(from, {
    text: `💘 *Ship Calculator*\n━━━━━━━━━━━━━━━\n👤 ${name1} + ${name2} 👤\n\n${bar}\n\n💯 Compatibility: *${score}%*\n${emoji} ${verdict}\n━━━━━━━━━━━━━━━`,
  });
};
