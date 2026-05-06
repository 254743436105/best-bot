// src/commands/sports.js
async function execute(sock, msg, args, jid) {
  try {
    const topic = args.length ? args.join(' ') : 'sports';
    const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&category=sports&lang=en&max=5&apikey=demo`);
    const data = await res.json();

    // Fallback to RSS if API fails
    if (!data.articles || !data.articles.length) {
      const rss = await fetch('https://feeds.bbci.co.uk/sport/rss.xml');
      const text = await rss.text();
      const items = [...text.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>/g)].slice(1, 6);
      if (!items.length) return sock.sendMessage(jid, { text: '❌ Could not fetch sports news.' });

      const headlines = items.map((m, i) => `${i + 1}. ${m[1]}`).join('\n');
      return sock.sendMessage(jid, { text: `⚽ *Latest Sports News*\n\n${headlines}\n\n📡 Source: BBC Sport` });
    }

    const headlines = data.articles.map((a, i) =>
      `${i + 1}. *${a.title}*\n   📰 ${a.source.name}`
    ).join('\n\n');

    await sock.sendMessage(jid, {
      text: `⚽ *Sports News${args.length ? ` — ${topic}` : ''}*\n\n${headlines}`
    });
  } catch (e) {
    await sock.sendMessage(jid, { text: '❌ Failed to fetch sports news. Try again.' });
  }
}
module.exports = { execute };
