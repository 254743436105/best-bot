const axios = require('axios');

module.exports = async (sock, msg, args, from) => {
  try {
    await sock.sendMessage(from, { text: '📰 Fetching latest news...' });

    const topic = args.join(' ') || 'world';
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=5&apikey=free`;

    // Use RSS fallback (no API key needed)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en&gl=US&ceid=US:en`;
    const res = await axios.get(rssUrl, { timeout: 10000 });

    // Parse RSS
    const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
    if (!items.length) {
      return sock.sendMessage(from, { text: '❌ No news found. Try a different topic.' });
    }

    const news = items.slice(0, 5).map((item, i) => {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || 'No title';
      const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/))?.[1] || '';
      const date = pubDate ? new Date(pubDate).toLocaleDateString('en-KE') : '';
      return `${i + 1}. ${title}${date ? `\n   📅 ${date}` : ''}`;
    });

    await sock.sendMessage(from, {
      text: `📰 *Latest News: ${topic}*\n━━━━━━━━━━━━━━━\n${news.join('\n\n')}\n━━━━━━━━━━━━━━━\n_Powered by Google News_`,
    });
  } catch (err) {
    console.error('News error:', err.message);
    await sock.sendMessage(from, { text: '❌ Could not fetch news. Try again later.' });
  }
};
