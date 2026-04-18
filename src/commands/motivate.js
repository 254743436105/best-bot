const quotes = [
  "The only way to do great work is to love what you do. — Steve Jobs 💡","Believe you can and you're halfway there. — Theodore Roosevelt 💪","It always seems impossible until it's done. — Nelson Mandela 🌟","Your time is limited, don't waste it living someone else's life. — Steve Jobs ⏰","The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt 🌈","Success is not final, failure is not fatal — it's the courage to continue that counts. — Winston Churchill 🏆","In the middle of every difficulty lies opportunity. — Albert Einstein 🔑","Don't watch the clock; do what it does. Keep going. — Sam Levenson 🚀",
];
module.exports = async (sock, msg, args, from) => {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  await sock.sendMessage(from, { text: `💪 *Motivation*\n\n_${q}_` });
};
