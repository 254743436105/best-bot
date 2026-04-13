const responses = [
  '✅ It is certain', '✅ It is decidedly so', '✅ Without a doubt',
  '✅ Yes definitely', '✅ You may rely on it', '✅ As I see it, yes',
  '✅ Most likely', '✅ Outlook good', '✅ Yes', '✅ Signs point to yes',
  '🤔 Reply hazy, try again', '🤔 Ask again later', '🤔 Better not tell you now',
  '🤔 Cannot predict now', '🤔 Concentrate and ask again',
  '❌ Don\'t count on it', '❌ My reply is no', '❌ My sources say no',
  '❌ Outlook not so good', '❌ Very doubtful',
];

module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, { text: '🎱 Usage: `!8ball <question>`\nExample: `!8ball Will I be rich?`' });
  }

  const question = args.join(' ');
  const response = responses[Math.floor(Math.random() * responses.length)];

  await sock.sendMessage(from, {
    text: `🎱 *Magic 8 Ball*\n━━━━━━━━━━━━━━━\n❓ ${question}\n\n${response}\n━━━━━━━━━━━━━━━`,
  });
};
