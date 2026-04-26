const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PREFIX = process.env.PREFIX || '!';

// ── helpers ──────────────────────────────────────────────────────────────────
function getBody(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ''
  );
}

function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

// ── command map ───────────────────────────────────────────────────────────────
const commands = {
  help: require('../commands/help'),
  ping: require('../commands/ping'),
  time: require('../commands/time'),
  weather: require('../commands/weather'),
  remind: require('../commands/remind'),
  reminders: require('../commands/reminders'),
  calc: require('../commands/calc'),
  play: require('../commands/play'),
  statusview: require('../commands/statusview'),
  joke: require('../commands/joke'),
  quote: require('../commands/quote'),
  sticker: require('../commands/sticker'),
  welcome: require('../commands/welcome'),
  goodbye: require('../commands/goodbye'),
};

async function handleMessage(sock, msg) {
  try {
    const body = getBody(msg).trim();
    if (!body.startsWith(PREFIX)) return;

    const [rawCmd, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = rawCmd.toLowerCase();
    const jid = msg.key.remoteJid;
    const sender = getSender(msg);

    if (commands[cmd]) {
      await commands[cmd].execute(sock, msg, args, jid, sender);
    } else {
      await sock.sendMessage(jid, { text: `❓ Unknown command. Type *${PREFIX}help* to see all commands.` });
    }
  } catch (err) {
    console.error('handleMessage error:', err);
  }
}

module.exports = { handleMessage };
