require('dotenv').config();
const http = require('http');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { handleMessage } = require('./handlers/messageHandler');
const { loadReminders, checkReminders } = require('./handlers/reminderHandler');
const { handleStatus } = require('./handlers/statusHandler');
const { restoreSession, saveSession } = require('./session-manager');
const cron = require('node-cron');
const fs = require('fs');

const AUTH_DIR = './auth_info';
const PORT = process.env.PORT || 3000;

// HTTP server for Heroku web dyno
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Bot is running ✅');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

async function startBot() {
  restoreSession();

  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`🤖 Starting WhatsApp Personal Assistant Bot (Baileys v${version.join('.')})`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['Personal Assistant', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', () => {
    saveCreds();
    saveSession();
  });

  // ✅ Handle QR code manually (new way)
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n');
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed (code ${code}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) setTimeout(startBot, 5000);
      else console.log('🚫 Logged out. Clear SESSION_DATA config var and restart.');
    }

    if (connection === 'open') {
      console.log('✅ Bot connected! Send !help to your WhatsApp to test it.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key?.remoteJid === 'status@broadcast') {
        await handleStatus(sock, msg);
        continue;
      }
      if (msg.key.fromMe) continue;
      await handleMessage(sock, msg);
    }
  });

  loadReminders();
  cron.schedule('* * * * *', () => checkReminders(sock));
}

startBot().catch(console.error);
