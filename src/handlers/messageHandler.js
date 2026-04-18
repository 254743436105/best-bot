const commands = require('../commands');

const PREFIX = process.env.PREFIX || '!';

async function handleMessage(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      '';

    if (!body.startsWith(PREFIX)) return;

    const [rawCmd, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
    const command = rawCmd.toLowerCase();

    console.log(`📩 [${new Date().toISOString()}] Command: ${command} | From: ${from}`);

    const handler = commands[command];

    if (handler) {
      await handler(sock, msg, args, from);
    } else {
      await sock.sendMessage(from, {
        text: `❓ Unknown command: *${PREFIX}${command}*\nType *${PREFIX}help* to see all commands.`,
      });
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
}

module.exports = { handleMessage };
