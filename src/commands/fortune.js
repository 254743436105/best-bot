const fortunes = [
  "A great opportunity will come your way soon 🌟","You will find what you've been looking for 🔍","Good things take time — be patient ⏰","Your hard work will pay off soon 💪","Adventure awaits you just around the corner 🗺️","Love is closer than you think ❤️","A surprise is heading your way 🎁","Your kindness will be rewarded 🙏","Take a chance — you won't regret it 🎲","The answer you seek is within you 💡","New beginnings are on the horizon 🌅","Trust your instincts — they won't fail you 🧭","Your best days are still ahead of you 🚀","Share your light with the world ✨","Believe in yourself — great things await 🏆",
];
module.exports = async (sock, msg, args, from) => {
  const f = fortunes[Math.floor(Math.random()*fortunes.length)];
  await sock.sendMessage(from, { text: `🔮 *Fortune Cookie*\n\n_${f}_\n\n🥠 _Break open your cookie of wisdom!_` });
};
