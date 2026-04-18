const games = {};
function renderBoard(b) { return `${b[0]}|${b[1]}|${b[2]}\n─┼─┼─\n${b[3]}|${b[4]}|${b[5]}\n─┼─┼─\n${b[6]}|${b[7]}|${b[8]}`; }
function checkWin(b, p) { const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; return wins.some(w=>w.every(i=>b[i]===p)); }
function aiMove(b) { const empty=b.map((v,i)=>v==='⬜'?i:-1).filter(i=>i>=0); return empty[Math.floor(Math.random()*empty.length)]; }
module.exports = async (sock, msg, args, from) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  if (args[0]==='start') {
    games[from] = { board: Array(9).fill('⬜'), player: '❌' };
    return sock.sendMessage(from, { text: `🎮 *Tic Tac Toe Started!*\nYou are ❌, Bot is ⭕\n\n${renderBoard(games[from].board)}\n\nPlay: \`!ttt <1-9>\`\n1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣` });
  }
  const game = games[from];
  if (!game) return sock.sendMessage(from, { text: '❌ No active game. Start with `!ttt start`' });
  const pos = parseInt(args[0]) - 1;
  if (isNaN(pos)||pos<0||pos>8||game.board[pos]!=='⬜') return sock.sendMessage(from, { text: '❌ Invalid move.' });
  game.board[pos] = '❌';
  if (checkWin(game.board,'❌')) { delete games[from]; return sock.sendMessage(from, { text: `🎮 *Board*\n${renderBoard(game.board)}\n\n🏆 *You win!*` }); }
  if (!game.board.includes('⬜')) { delete games[from]; return sock.sendMessage(from, { text: `🎮 *Board*\n${renderBoard(game.board)}\n\n🤝 *Draw!*` }); }
  const ai = aiMove(game.board);
  game.board[ai] = '⭕';
  if (checkWin(game.board,'⭕')) { delete games[from]; return sock.sendMessage(from, { text: `🎮 *Board*\n${renderBoard(game.board)}\n\n🤖 *Bot wins!*` }); }
  if (!game.board.includes('⬜')) { delete games[from]; return sock.sendMessage(from, { text: `🎮 *Board*\n${renderBoard(game.board)}\n\n🤝 *Draw!*` }); }
  await sock.sendMessage(from, { text: `🎮 *Board*\n${renderBoard(game.board)}\n\nYour turn! \`!ttt <1-9>\`` });
};
