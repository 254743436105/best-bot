const puns = [
  "I'm on a seafood diet. I see food and I eat it 🍕","Time flies like an arrow; fruit flies like a banana 🍌","I used to be a banker, but I lost interest 💸","Why did the bicycle fall over? Because it was two-tired 🚲","What do you call a fake noodle? An impasta 🍝","I would tell you a chemistry joke but I know I wouldn't get a reaction 🧪","A skeleton walks into a bar and orders a beer and a mop 🦴","Did you hear about the claustrophobic astronaut? He just needed a little space 🚀","Why don't eggs tell jokes? They'd crack each other up 🥚","What do you call a bear with no teeth? A gummy bear 🐻",
];
module.exports = async (sock, msg, args, from) => {
  await sock.sendMessage(from, { text: `😄 *Pun*\n\n${puns[Math.floor(Math.random()*puns.length)]}` });
};
