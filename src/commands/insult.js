const insults = [
  "You're not stupid, you just have bad luck thinking 🤔","I'd explain it to you but I don't have any crayons 🖍️","You're like a software update — nobody wants you but eventually we're stuck with you 💻","Brains aren't everything. In your case they're nothing 🧠","I could agree with you, but then we'd both be wrong 🤷","You're so slow, it takes you an hour and a half to watch 60 Minutes ⏰","When was the last time you lay on the floor and just looked up at the ceiling? Me neither, but it's probably more interesting than you 😂","I'm not insulting you, I'm describing you 😏","Your secrets are safe with me — I never listen when you talk 🙉","You are proof that evolution can go in reverse 🐒",
];
module.exports = async (sock, msg, args, from) => {
  await sock.sendMessage(from, { text: `😈 *Friendly Insult*\n\n${insults[Math.floor(Math.random()*insults.length)]}\n\n_All in good fun! 😂_` });
};
