const axios = require('axios');
module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage: `!github <username>`' });
  try {
    const res = await axios.get(`https://api.github.com/users/${args[0]}`, { timeout: 8000 });
    const u = res.data;
    await sock.sendMessage(from, { text: `🐙 *GitHub: ${u.login}*\n━━━━━━━━━━━━━━━\n👤 Name: ${u.name || 'N/A'}\n📝 Bio: ${u.bio || 'N/A'}\n📦 Repos: ${u.public_repos}\n👥 Followers: ${u.followers}\n👣 Following: ${u.following}\n🏢 Company: ${u.company || 'N/A'}\n📍 Location: ${u.location || 'N/A'}\n🔗 ${u.html_url}` });
  } catch { await sock.sendMessage(from, { text: `❌ GitHub user not found: *${args[0]}*` }); }
};
