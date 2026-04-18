const compliments = [
  "You're smarter than Google 🧠","You light up every room you enter ✨","You're a true legend 👑","Your smile could cure any bad day 😊","You make the world a better place 🌍","You're more fun than a bag of puppies 🐶","You have the best laugh ever 😂","You're one in a billion 💎","Your heart is made of gold ❤️","You're unstoppable 💪","You're a vibe and a half ✨","You deserve all the good things 🌟","You're the real MVP 🏆","You're braver than you believe 🦁","You radiate good energy 🌈",
];
module.exports = async (sock, msg, args, from) => {
  const c = compliments[Math.floor(Math.random() * compliments.length)];
  await sock.sendMessage(from, { text: `💝 *Compliment*\n\n${c}` });
};
