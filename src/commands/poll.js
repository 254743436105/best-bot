module.exports = async (sock, msg, args, from) => {
  if (args.length < 3) return sock.sendMessage(from, { text: '⚠️ Usage: `!poll <question> | <option1> | <option2> | ...`\nExample: `!poll Best food? | Pizza | Burger | Tacos`' });
  const parts = args.join(' ').split('|').map(p => p.trim()).filter(Boolean);
  if (parts.length < 3) return sock.sendMessage(from, { text: '❌ Need at least a question and 2 options separated by `|`' });
  const question = parts[0];
  const options = parts.slice(1);
  const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  const optionText = options.map((o, i) => `${emojis[i]} ${o}`).join('\n');
  await sock.sendMessage(from, { text: `📊 *POLL*\n━━━━━━━━━━━━━━━\n❓ ${question}\n━━━━━━━━━━━━━━━\n${optionText}\n━━━━━━━━━━━━━━━\n_Vote by replying with the number!_` });
};
