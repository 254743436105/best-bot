const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  try {
    const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 8000 });
    await sock.sendMessage(from, { text: `🤓 *Random Fact*\n\n${res.data.text}` });
  } catch {
    const facts = ["Honey never spoils — 3000-year-old honey found in Egyptian tombs is still edible 🍯","A group of flamingos is called a flamboyance 🦩","Octopuses have three hearts 🐙","Bananas are technically berries 🍌","A day on Venus is longer than a year on Venus ☄️"];
    await sock.sendMessage(from, { text: `🤓 *Random Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}` });
  }
};
