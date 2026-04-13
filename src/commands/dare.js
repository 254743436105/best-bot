const dares = [
  'Send a voice note singing your favorite song 🎤',
  'Change your profile picture to a funny face for 1 hour 😂',
  'Send a voice note saying "I love WhatsApp bots" in a funny voice',
  'Text someone you haven\'t talked to in a month 📱',
  'Send your most embarrassing photo in your gallery 😅',
  'Do 10 push-ups and send proof 💪',
  'Change your WhatsApp status to "I lost a dare" for 30 minutes',
  'Send a voice note of you doing your best animal impression 🦁',
  'Tell a joke to the group 😄',
  'Send a selfie with a funny filter 🤳',
  'Write a poem about the last person who texted you 📝',
  'Send a voice note saying the alphabet backwards',
  'Change your name in this group to "Dare Loser" for 1 hour 😂',
  'Send your most recent sent photo',
  'Do your best celebrity impression in a voice note',
];

module.exports = async (sock, msg, args, from) => {
  const dare = dares[Math.floor(Math.random() * dares.length)];
  await sock.sendMessage(from, {
    text: `🎯 *DARE*\n━━━━━━━━━━━━━━━\n${dare}\n━━━━━━━━━━━━━━━\n_You must complete this dare!_ 😈`,
  });
};
