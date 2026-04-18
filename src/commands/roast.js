const roasts = [
  "You're the human version of a participation trophy 🏅","You're not stupid, you just have bad luck thinking 🤔","I'd agree with you but then we'd both be wrong 😅","You're like a cloud — when you disappear, it's a beautiful day ☀️","You bring everyone so much joy when you leave the room 🚪","Your secrets are safe with me. I never listen anyway 😂","I'm jealous of people who haven't met you yet 😬","You're not completely useless — you can always serve as a bad example 😏","If laughter is the best medicine, your face must be curing diseases 😂","You're like a software update — when I see you, I think 'not now' 💻",
];
module.exports = async (sock, msg, args, from) => {
  const r = roasts[Math.floor(Math.random() * roasts.length)];
  await sock.sendMessage(from, { text: `🔥 *Friendly Roast*\n\n${r}\n\n_All in good fun! 😂_` });
};
