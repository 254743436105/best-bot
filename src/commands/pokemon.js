const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  const name = args[0] || String(Math.floor(Math.random()*898)+1);
  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`, { timeout: 8000 });
    const p = res.data;
    const types = p.types.map(t=>t.type.name).join(', ');
    const stats = p.stats.map(s=>`${s.stat.name}: ${s.base_stat}`).join(' | ');
    await sock.sendMessage(from, { text: `🎮 *${p.name.toUpperCase()} #${p.id}*\n━━━━━━━━━━━━━━━\n🔖 Type: ${types}\n💪 Base Stats:\n${stats}\n📏 Height: ${p.height/10}m\n⚖️ Weight: ${p.weight/10}kg` });
  } catch { await sock.sendMessage(from, { text: `❌ Pokémon not found: *${name}*` }); }
};
