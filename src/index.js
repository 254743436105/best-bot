require('dotenv').config();
const http = require('http');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, isJidBroadcast } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { handleMessage }              = require('./handlers/messageHandler');
const { loadReminders, checkReminders } = require('./handlers/reminderHandler');
const { handleStatus }               = require('./handlers/statusHandler');
const { handleStatusSave }           = require('./handlers/statusSaveHandler');
const { cacheMessage, handleDelete } = require('./handlers/antideleteHandler');
const { restoreSession }             = require('./session-manager');
const cron = require('node-cron');
const fs   = require('fs');

const AUTH_DIR = './auth_info';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WhatsApp Bot is running ✅');
});
server.listen(PORT, () => console.log(`🌐 HTTP server listening on port ${PORT}`));

// Keep-alive ping every 5 minutes
setInterval(() => {
  http.get(`http://localhost:${PORT}/`, () => {});
}, 5 * 60 * 1000);

async function startBot() {
  restoreSession();
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  console.log(`🤖 Starting WhatsApp Bot (Baileys v${version.join('.')})`);

  const sock = makeWASocket({
    version,
    auth:    state,
    logger:  pino({ level: 'silent' }),
    browser: ['Personal Assistant', 'Chrome', '1.0.0'],
    getMessage: async () => ({ conversation: '' }),
    shouldIgnoreJid: jid => isJidBroadcast(jid),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed (code ${code}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) setTimeout(startBot, 5000);
      else console.log('🚫 Logged out. Clear SESSION_DATA and restart.');
    }
    if (connection === 'open') {
      console.log('✅ Bot connected! Send !help to test.');
      try {
        const myJid = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
        await sock.sendMessage(myJid, {
          text: `🤖 *Connected by Mungai Yobih*\n\n✅ Bot is online and ready!\n\n_Type !help to see all commands_`
        });
      } catch (e) {
        console.error('Failed to send connect message:', e.message);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      // ✅ Auto-view and save ALL statuses to inbox
      if (msg.key?.remoteJid === 'status@broadcast') {
        await handleStatus(sock, msg);
        await handleStatusSave(sock, msg);
        continue;
      }

      // ✅ Anti View-Once — forward to same chat automatically
      const m = msg.message;
      const viewOnceMsg =
        m.viewOnceMessage?.message ||
        m.viewOnceMessageV2?.message ||
        m.viewOnceMessageV2Extension?.message;

      if (viewOnceMsg) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNum = sender.split('@')[0];
        try {
          if (viewOnceMsg.imageMessage) {
            await sock.sendMessage(msg.key.remoteJid, {
              image: { url: viewOnceMsg.imageMessage.url },
              mimetype: viewOnceMsg.imageMessage.mimetype,
              caption: `👁️ *View Once Opened*\nFrom: @${senderNum}`,
              mentions: [sender],
            });
          }
          if (viewOnceMsg.videoMessage) {
            await sock.sendMessage(msg.key.remoteJid, {
              video: { url: viewOnceMsg.videoMessage.url },
              mimetype: viewOnceMsg.videoMessage.mimetype,
              caption: `👁️ *View Once Opened*\nFrom: @${senderNum}`,
              mentions: [sender],
            });
          }
        } catch (e) {
          console.error('viewonce error:', e.message);
        }
      }

      // ✅ Cache all messages for antidelete
      cacheMessage(msg);

      // Skip own messages for commands
      if (msg.key.fromMe) continue;

      // ✅ Handle commands — works in both DMs and groups
      await handleMessage(sock, msg);
    }
  });

  // ✅ Auto send deleted messages back to same chat
  sock.ev.on('messages.update', async (updates) => {
    const deleted = updates.filter(u =>
      u.update?.messageStubType === 1 ||
      u.update?.message === null
    );
    if (deleted.length) await handleDelete(sock, deleted);
  });

  // ✅ Welcome/Goodbye on group participant updates
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const { welcomeEnabled } = require('./commands/welcome');
      const { goodbyeEnabled } = require('./commands/goodbye');

      for (const jid of participants) {
        const num = jid.split('@')[0];
        if (action === 'add' && welcomeEnabled[id]) {
          await sock.sendMessage(id, {
            text: `👋 *Welcome to the group!*\n\n@${num} has joined! 🎉\nWe're glad to have you here!`,
            mentions: [jid],
          });
        }
        if (action === 'remove' && goodbyeEnabled[id]) {
          await sock.sendMessage(id, {
            text: `👋 *Goodbye!*\n\n@${num} has left the group. 😢`,
            mentions: [jid],
          });
        }
      }
    } catch (e) {}
  });

  loadReminders();
  cron.schedule('* * * * *', () => checkReminders(sock));
}

startBot().catch(console.error);
