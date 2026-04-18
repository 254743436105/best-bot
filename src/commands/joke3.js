// yo mama jokes (clean)
const jokes = [
  "Yo mama so kind, she gives directions to people who aren't even lost 😇","Yo mama so smart, Google asks her questions 🧠","Yo mama so strong, she does push-ups with one hand tied behind her back 💪","Yo mama's cooking is so good, the neighbors pretend they're hungry 😂","Yo mama so fast, she finished a marathon before it started 🏃","Yo mama so funny, even the Joker laughs at her jokes 😂","Yo mama so wise, fortune cookies read HER 🥠","Yo mama so organized, she alphabetizes her cereal boxes 📦","Yo mama so cool, ice asks to hang out with her ❄️","Yo mama so positive, she turns lemons into lemonade AND a lemonade stand 🍋",
];
module.exports = async (sock, msg, args, from) => {
  await sock.sendMessage(from, { text: `😂 *Yo Mama Joke*\n\n${jokes[Math.floor(Math.random()*jokes.length)]}\n\n_All in good fun! 😂_` });
};
