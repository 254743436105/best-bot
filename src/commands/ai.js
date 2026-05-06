// src/commands/ai.js
async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '🤖 Usage: !ai <your question>' });
  }

  const question = args.join(' ');
  await sock.sendMessage(jid, { text: '🤖 Thinking...' });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
        max_tokens: 500,
      }),
    });

    // Try free fallback if above fails
    if (!res.ok) throw new Error('paid API failed');

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error('no answer');

    await sock.sendMessage(jid, { text: `🤖 *AI Response:*\n\n${answer}` });
  } catch {
    try {
      // Free fallback: pollinations.ai
      const res2 = await fetch(`https://text.pollinations.ai/${encodeURIComponent(question)}`);
      const answer = await res2.text();
      await sock.sendMessage(jid, { text: `🤖 *AI Response:*\n\n${answer.trim()}` });
    } catch {
      await sock.sendMessage(jid, { text: '❌ AI is unavailable right now. Try again later.' });
    }
  }
}
module.exports = { execute };
