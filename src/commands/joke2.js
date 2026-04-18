// dark humor jokes (clean)
const jokes = [
  "I told my doctor I broke my arm in two places. He told me to stop going to those places 😂","I used to hate facial hair but then it grew on me 😅","Why don't scientists trust atoms? Because they make up everything 😂","I'm reading a book about anti-gravity. It's impossible to put down 📚","Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them 🔢","Why did the scarecrow win an award? He was outstanding in his field 🌾","I only know 25 letters of the alphabet. I don't know y 😂","What do you call cheese that isn't yours? Nacho cheese 🧀","Why can't you give Elsa a balloon? Because she'll let it go 🎈","I asked my dog what 2 minus 2 is. He said nothing 🐶",
];
module.exports = async (sock, msg, args, from) => {
  await sock.sendMessage(from, { text: `😂 *Joke*\n\n${jokes[Math.floor(Math.random()*jokes.length)]}` });
};
