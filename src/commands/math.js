const problems = [
  { q: '12 × 15', a: 180 }, { q: '144 ÷ 12', a: 12 }, { q: '25 + 76', a: 101 },
  { q: '100 - 37', a: 63 }, { q: '18 × 7', a: 126 }, { q: '256 ÷ 16', a: 16 },
  { q: '999 + 1', a: 1000 }, { q: '50 × 50', a: 2500 }, { q: '1000 - 643', a: 357 },
];
const pending = {};
module.exports = async (sock, msg, args, jid) => {
  if (args.length && !isNaN(args[0]) && pending[from]) {
    const { a, startTime } = pending[from];
    delete pending[from];
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
    if (parseInt(args[0]) === a) return sock.sendMessage(jid, { text: `✅ *Correct!* 🎉\nAnswer: ${a}\nTime: ${timeTaken}s ⚡` });
    return sock.sendMessage(jid, { text: `❌ *Wrong!*\nCorrect answer: *${a}*` });
  }
  const p = problems[Math.floor(Math.random() * problems.length)];
  pending[from] = { a: p.a, startTime: Date.now() };
  setTimeout(() => { if (pending[from]) { delete pending[from]; sock.sendMessage(jid, { text: `⏰ Time's up! Answer was *${p.a}*` }); } }, 15000);
  await sock.sendMessage(jid, { text: `🧮 *Quick Math!*\n\n❓ ${p.q} = ?\n\n_You have 15 seconds!_` });
};
