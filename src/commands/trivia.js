const axios = require('axios');

const pendingTrivia = {}; // store active trivia per chat

module.exports = async (sock, msg, args, from) => {
  // Check if answering existing trivia
  if (args[0] && ['a', 'b', 'c', 'd'].includes(args[0].toLowerCase())) {
    const trivia = pendingTrivia[from];
    if (!trivia) {
      return sock.sendMessage(from, { text: '❌ No active trivia. Send `!trivia` to start one.' });
    }

    const answer = args[0].toUpperCase();
    clearTimeout(trivia.timeout);
    delete pendingTrivia[from];

    if (answer === trivia.correct) {
      return sock.sendMessage(from, {
        text: `✅ *Correct!* 🎉\n\nThe answer was: *${trivia.correct}. ${trivia.correctAnswer}*`,
      });
    } else {
      return sock.sendMessage(from, {
        text: `❌ *Wrong!*\n\nThe correct answer was: *${trivia.correct}. ${trivia.correctAnswer}*`,
      });
    }
  }

  try {
    const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 8000 });
    const q = res.data.results[0];

    const decode = str => str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"');

    const question = decode(q.question);
    const correct = decode(q.correct_answer);
    const incorrect = q.incorrect_answers.map(decode);

    const options = [...incorrect, correct].sort(() => Math.random() - 0.5);
    const labels = ['A', 'B', 'C', 'D'];
    const correctLabel = labels[options.indexOf(correct)];

    const optionText = options.map((o, i) => `${labels[i]}. ${o}`).join('\n');

    pendingTrivia[from] = {
      correct: correctLabel,
      correctAnswer: correct,
      timeout: setTimeout(() => {
        delete pendingTrivia[from];
        sock.sendMessage(from, { text: `⏰ Time's up! The answer was: *${correctLabel}. ${correct}*` });
      }, 30000),
    };

    await sock.sendMessage(from, {
      text: `🧠 *Trivia Time!*\n━━━━━━━━━━━━━━━\n📚 Category: ${q.category}\n🎯 Difficulty: ${q.difficulty}\n\n❓ ${question}\n\n${optionText}\n━━━━━━━━━━━━━━━\nReply with \`!trivia a/b/c/d\` — you have 30 seconds!`,
    });
  } catch (err) {
    console.error('Trivia error:', err.message);
    await sock.sendMessage(from, { text: '❌ Could not fetch trivia. Try again!' });
  }
};
