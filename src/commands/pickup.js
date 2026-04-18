const lines = [
  "Are you a magician? Because whenever I look at you, everyone else disappears ✨","Do you have a map? I keep getting lost in your eyes 🗺️","Are you a parking ticket? Because you've got 'fine' written all over you 😏","Is your name Google? Because you have everything I've been searching for 🔍","Do you believe in love at first sight, or should I walk by again? 😄","Are you made of copper and tellurium? Because you're CuTe 🧪","If you were a vegetable, you'd be a cute-cumber 🥒","Are you a bank loan? Because you've got my interest 💰","Do you like science? Because I've got great chemistry with you ⚗️","You must be a broom, because you swept me off my feet 🧹",
];
module.exports = async (sock, msg, args, from) => {
  await sock.sendMessage(from, { text: `💘 *Pick-Up Line*\n\n${lines[Math.floor(Math.random()*lines.length)]}` });
};
