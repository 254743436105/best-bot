const truths = [
  'What is your biggest fear? 😨',
  'What is the most embarrassing thing you\'ve done? 😅',
  'Who was your first crush? 💕',
  'What is your biggest secret? 🤫',
  'What is one thing you would change about yourself? 🤔',
  'Have you ever lied to get out of trouble? 😬',
  'What is the weirdest dream you\'ve ever had? 💭',
  'Who do you have a crush on right now? 😍',
  'What is something you\'ve never told anyone? 🤐',
  'What is your most used app on your phone? 📱',
  'What is the last thing you searched on Google? 🔍',
  'Have you ever cheated in a game or test? 😏',
  'What is one bad habit you have? 😶',
  'What is the most childish thing you still do? 😂',
  'What is your most irrational fear? 😱',
];

module.exports = async (sock, msg, args, from) => {
  const truth = truths[Math.floor(Math.random() * truths.length)];
  await sock.sendMessage(from, {
    text: `💬 *TRUTH*\n━━━━━━━━━━━━━━━\n${truth}\n━━━━━━━━━━━━━━━\n_You must answer honestly!_ 🫵`,
  });
};
