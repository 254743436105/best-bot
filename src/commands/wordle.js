const words = ['crane','slate','audio','adieu','raise','arise','irate','stare','snare','skate','plate','flame','blame','grade','trade','brave','crave','grave','shale','stale'];
const games = {};
function evaluate(guess, target) {
  return guess.split('').map((l,i) => {
    if (l === target[i]) return '🟩';
    if (target.includes(l)) return '🟨';
    return '⬛';
  }).join('');
}
module.exports = async (sock, msg, args, from) => {
  if (args[0]==='start'||!games[from]) {
    const word = words[Math.floor(Math.random()*words.length)];
    games[from] = { word, attempts: [], maxAttempts: 6 };
    return sock.sendMessage(from, { text: `🟩 *WORDLE*\nGuess the 5-letter word!\n\n🟩 = correct\n🟨 = wrong position\n⬛ = not in word\n\nGuess: \`!wordle <word>\`\n_${games[from].maxAttempts} attempts_` });
  }
  const game = games[from];
  if (args[0]==='quit') { const w=game.word; delete games[from]; return sock.sendMessage(from, { text: `❌ Word was: *${w}*` }); }
  const guess = (args[0]||'').toLowerCase();
  if (guess.length!==5||!/^[a-z]+$/.test(guess)) return sock.sendMessage(from, { text: '❌ Enter a 5-letter word.' });
  const result = evaluate(guess, game.word);
  game.attempts.push(`${result} ${guess.toUpperCase()}`);
  if (guess === game.word) { const att=game.attempts.length; delete games[from]; return sock.sendMessage(from, { text: `🎉 *You got it in ${att} attempt${att>1?'s':''}!*\n\n${game.attempts.join('\n')}` }); }
  if (game.attempts.length >= game.maxAttempts) { const w=game.word; delete games[from]; return sock.sendMessage(from, { text: `💀 *Game Over!*\nWord was: *${w}*\n\n${game.attempts.join('\n')}` }); }
  await sock.sendMessage(from, { text: `🟩 *WORDLE* (${game.attempts.length}/${game.maxAttempts})\n\n${game.attempts.join('\n')}\n\nGuess: \`!wordle <word>\`` });
};
