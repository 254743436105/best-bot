const riddles = [
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "An echo 🗣️" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps 👣" },
  { q: "I have cities, but no houses live there. Mountains, but no trees grow. Water, but no fish swim. What am I?", a: "A map 🗺️" },
  { q: "What has hands but can't clap?", a: "A clock ⏰" },
  { q: "What gets wetter the more it dries?", a: "A towel 🧻" },
  { q: "I have a head, a tail, but no body. What am I?", a: "A coin 🪙" },
  { q: "What can you catch but not throw?", a: "A cold 🤧" },
  { q: "The more you have of it, the less you see. What is it?", a: "Darkness 🌑" },
];
const pending = {};
module.exports = async (sock, msg, args, jid) => {
  if (args[0] === 'answer') {
    const riddle = pending[from];
    if (!riddle) return sock.sendMessage(jid, { text: '❌ No active riddle. Send `!riddle` first.' });
    delete pending[from];
    return sock.sendMessage(jid, { text: `💡 *Answer:* ${riddle.a}` });
  }
  const riddle = riddles[Math.floor(Math.random() * riddles.length)];
  pending[from] = riddle;
  await sock.sendMessage(jid, { text: `🧩 *Riddle*\n━━━━━━━━━━━━━━━\n${riddle.q}\n━━━━━━━━━━━━━━━\nSend \`!riddle answer\` to reveal the answer!` });
};
