async function execute(sock, msg, args, jid) {
  const target = args[0] || 'the mainframe';
  const frames = [
    `\`\`\`\n[▓░░░░░░░░░]  10%  Initializing hack on ${target}...\`\`\``,
    `\`\`\`\n[▓▓▓░░░░░░░]  30%  Bypassing firewall...\`\`\``,
    `\`\`\`\n[▓▓▓▓▓░░░░░]  50%  Injecting payload...\`\`\``,
    `\`\`\`\n[▓▓▓▓▓▓▓░░░]  70%  Cracking encryption...\`\`\``,
    `\`\`\`\n[▓▓▓▓▓▓▓▓▓░]  90%  Downloading data...\`\`\``,
    `\`\`\`\n[▓▓▓▓▓▓▓▓▓▓] 100%  ACCESS GRANTED 💀\`\`\`\n\n✅ *${target} has been hacked!*\n_(jk, this is just a prank 😂)_`,
  ];
  for (const frame of frames) {
    await sock.sendMessage(jid, { text: frame });
    await new Promise(r => setTimeout(r, 1500));
  }
}
module.exports = { execute };
