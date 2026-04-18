const words = ['javascript','nodejs','whatsapp','programming','developer','database','internet','computer','keyboard','software'];
const games = {};
function display(word, guessed) { return word.split('').map(l => guessed.includes(l) ? l : '_').join(' '); }
module.exports = async (sock, msg, args, from) => {
  if (args[0]==='start'||!games[from]) {
    const word = words[Math.floor(Math.random()*words.length)];
    games[from] = { word, guessed: [], wrong: 0, maxWrong: 6 };
    return sock.sendMessage(from, { text: `🎮 *Hangman*\n\n${display(word,[])}\n\nGuess a letter: \`!hangman <letter>\`` });
  }
  const game = games[from];
  if (args[0]==='quit') { const w=game.word; delete games[from]; return sock.sendMessage(from, { text: `❌ Game over! Word was: *${w}*` }); }
  const letter = (args[0]||'').toLowerCase();
  if (!letter||letter.length!==1||!/[a-z]/.test(letter)) return sock.sendMessage(from, { text: '❌ Send a single letter.' });
  if (game.guessed.includes(letter)) return sock.sendMessage(from, { text: `⚠️ Already guessed: *${letter}*` });
  game.guessed.push(letter);
  if (!game.word.includes(letter)) game.wrong++;
  const disp = display(game.word, game.guessed);
  if (!disp.includes('_')) { delete games[from]; return sock.sendMessage(from, { text: `✅ *You won! 🎉*\nWord: *${game.word}*` }); }
  if (game.wrong >= game.maxWrong) { const w=game.word; delete games[from]; return sock.sendMessage(from, { text: `💀 *Game Over!*\nWord was: *${w}*` }); }
  await sock.sendMessage(from, { text: `🎮 *Hangman*\n\n${disp}\n\n❌ Wrong: ${game.wrong}/${game.maxWrong}\n📝 Guessed: ${game.guessed.join(', ')}\n\nGuess: \`!hangman <letter>\` or \`!hangman quit\`` });
};
