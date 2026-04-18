module.exports = async (sock, msg, args, from) => {
  if (!args.length) return sock.sendMessage(from, { text: '⚠️ Usage: `!howold <name>`' });
  const name = args.join(' ');
  let age = 0; for (let i=0;i<name.length;i++) age += name.charCodeAt(i);
  age = (age % 60) + 18;
  await sock.sendMessage(from, { text: `🎂 *How Old Are You?*\n\n${name} looks *${age} years old*! 😂\n\n_Just for fun!_` });
};
