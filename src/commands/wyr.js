const questions = [
  'Would you rather be able to fly ✈️ or be invisible 👻?',
  'Would you rather have unlimited money 💰 or unlimited time ⏰?',
  'Would you rather live in the city 🏙️ or the countryside 🌾?',
  'Would you rather be famous 🌟 or be the best friend of someone famous?',
  'Would you rather speak all languages 🌍 or play all instruments 🎸?',
  'Would you rather have super strength 💪 or super speed ⚡?',
  'Would you rather eat only sweet 🍬 or only salty 🧂 forever?',
  'Would you rather time travel to the past ⏪ or future ⏩?',
  'Would you rather have a pet dragon 🐉 or a pet unicorn 🦄?',
  'Would you rather always be cold ❄️ or always be hot 🔥?',
  'Would you rather be 10 years older 👴 or 10 years younger 👶?',
  'Would you rather lose your phone 📱 or lose your wallet 👛?',
  'Would you rather be able to read minds 🧠 or see the future 🔮?',
  'Would you rather only eat pizza 🍕 or only eat tacos 🌮 for the rest of your life?',
  'Would you rather have no internet 📵 or no music 🎵 for a month?',
];

module.exports = async (sock, msg, args, from) => {
  const q = questions[Math.floor(Math.random() * questions.length)];
  await sock.sendMessage(from, {
    text: `🤔 *Would You Rather?*\n━━━━━━━━━━━━━━━\n${q}\n━━━━━━━━━━━━━━━\n_Reply with your answer!_ 👇`,
  });
};
