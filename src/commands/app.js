// src/commands/app.js
async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '📱 Usage: !app <app name>\nExample: !app WhatsApp' });
  }

  const query = args.join(' ');
  await sock.sendMessage(jid, { text: `🔍 Searching Google Play for *${query}*...` });

  try {
    const res = await fetch(`https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`);
    const html = await res.text();

    // Extract basic info from meta tags
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - Google Play', '').trim() : query;

    await sock.sendMessage(jid, {
      text: `📱 *Google Play Search: ${query}*\n\n🔗 View results:\nhttps://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps\n\n💡 Tip: Copy the link and open in your browser to install.`
    });
  } catch (e) {
    await sock.sendMessage(jid, {
      text: `📱 *Search for: ${query}*\n\n🔗 https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`
    });
  }
}
module.exports = { execute };
