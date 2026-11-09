require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const cron = require('node-cron');
const { handleMessage } = require('./handlers/messageHandler');
const { loadReminders, checkReminders } = require('./handlers/reminderHandler');
const { handleStatus } = require('./handlers/statusHandler');
const { handleStatusSave } = require('./handlers/statusSaveHandler');
const { cacheMessage, handleDelete } = require('./handlers/antideleteHandler');
const { restoreSession, saveSession } = require('./session-manager');
const pairing = require('./pairing/pair-manager');

const AUTH_DIR = path.join(process.cwd(), 'auth_info');
const PORT = process.env.PORT || 3000;
const BOT_NAME = 'ADEZ NEXUS';
const OWNER_NAME = process.env.OWNER_NAME || 'Arnold Adez';
const OWNER_CONTACT = process.env.OWNER_CONTACT || '';
const PAIR_PAGE = fs.readFileSync(path.join(__dirname, 'pairing', 'pair-page.html'), 'utf8');

let mainSock = null;   // the bot's live WhatsApp connection (null until paired)
let mainGen = 0;       // increments on every (re)start; old connections are ignored
let botPaired = false;
let connected = false; // true only while the WhatsApp connection is open
let version;           // Baileys protocol version, fetched once at boot
let announced = false; // "Online" message is sent only once per process

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ── helpers ───────────────────────────────────────────────────────

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(JSON.stringify(body));
}

function readJson(req, res, handler) {
  let raw = '';
  let tooLarge = false;
  req.on('data', chunk => {
    if (tooLarge) return;
    raw += chunk;
    if (raw.length > 2048) {
      tooLarge = true;
      sendJson(res, 413, { error: 'Request too large.' });
    }
  });
  req.on('end', () => {
    if (tooLarge) return;
    let body;
    try { body = JSON.parse(raw || '{}'); } catch { return sendJson(res, 400, { error: 'Invalid request.' }); }
    handler(body).catch(err => {
      if (err.status) return sendJson(res, err.status, { error: err.message });
      console.error('Request error:', err);
      sendJson(res, 500, { error: 'Something went wrong. Try again.' });
    });
  });
}

function isPairedOnDisk() {
  try {
    const creds = JSON.parse(fs.readFileSync(path.join(AUTH_DIR, 'creds.json'), 'utf8'));
    return Boolean(creds.registered);
  } catch {
    return false;
  }
}

function endMainSocket() {
  if (mainSock) {
    try { mainSock.end(undefined); } catch {}
    mainSock = null;
  }
}

function clearSession(message) {
  botPaired = false;
  connected = false;
  endMainSocket();
  fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  console.log(message);
}

async function sendOnlineMessage(sock) {
  try {
    const myJid = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
    const contactLine = OWNER_CONTACT ? `\nContact: ${OWNER_CONTACT}` : '';
    await sock.sendMessage(myJid, {
      text: `*${BOT_NAME} Online*\n\nOwner: ${OWNER_NAME}${contactLine}\n\nBot is online and ready!\n\n_Type !help to see all commands_`,
    });
  } catch (e) {
    console.error('Failed to send connect message:', e.message);
  }
}

// ── HTTP server (pairing page + API) ──────────────────────────────

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');

  const url = req.url.split('?')[0];

  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`${BOT_NAME} is running`);
  }

  if (req.method === 'GET' && url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    });
    return res.end(PAIR_PAGE);
  }

  if (req.method === 'GET' && url === '/api/status') {
    return sendJson(res, 200, {
      paired: botPaired,
      connected,
      active: pairing.activeCount(),
    });
  }

  if (req.method === 'POST' && (url === '/api/pair' || url === '/api/qr')) {
    return readJson(req, res, async body => {
      const type = url === '/api/pair' ? 'code' : 'qr';
      let phone = null;
      if (type === 'code') {
        phone = String(body.phone || '').replace(/\D/g, '');
        if (!/^\d{8,15}$/.test(phone)) {
          return sendJson(res, 400, { error: 'Enter a valid phone number with country code, digits only.' });
        }
      }
      const session = await pairing.createSession({ type, phone });
      return sendJson(res, 202, pairing.view(session));
    });
  }

  const match = url.match(/^\/api\/sessions\/([a-f0-9]{16})$/);
  if (match) {
    if (req.method === 'GET') {
      const session = pairing.getSession(match[1]);
      if (!session) return sendJson(res, 404, { error: 'Session not found or expired.' });
      return sendJson(res, 200, pairing.view(session));
    }
    if (req.method === 'DELETE') {
      const session = pairing.cancelSession(match[1]);
      if (!session) return sendJson(res, 404, { error: 'Session not found or expired.' });
      return sendJson(res, 200, pairing.view(session));
    }
  }

  sendJson(res, 404, { error: 'Not found.' });
});

server.listen(PORT, () => console.log(`HTTP server listening on port ${PORT}`));

setInterval(() => {
  http.get(`http://localhost:${PORT}/health`, res => res.resume()).on('error', () => {});
}, 5 * 60 * 1000);

// ── WhatsApp bot connection ───────────────────────────────────────

async function startBot() {
  const gen = ++mainGen;
  endMainSocket();
  connected = false;

  botPaired = isPairedOnDisk();
  if (!botPaired) {
    console.log('ℹ️ Not paired yet. Open the pairing page to link a WhatsApp number.');
    return;
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  console.log(`Starting ${BOT_NAME}${version ? ` (Baileys v${version.join('.')})` : ''}`);

  const sock = makeWASocket({
    ...(version ? { version } : {}),
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: pairing.PAIR_BROWSER,
    getMessage: async () => ({ conversation: '' }),
    shouldIgnoreJid: jid => isJidBroadcast(jid),
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 250,
  });
  mainSock = sock;

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    saveSession();
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (gen !== mainGen) return;

    if (connection === 'open') {
      connected = true;
      console.log(`${BOT_NAME} connected! Send !help to test.`);
      saveSession();
      if (!announced) {
        announced = true;
        // Wait a few seconds so the connection is fully ready before sending.
        setTimeout(() => {
          if (gen === mainGen) sendOnlineMessage(sock);
        }, 5000);
      }
    }

    if (connection === 'close') {
      connected = false;
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log(`Connection closed (code ${code}).`);

      if (code === DisconnectReason.loggedOut) {
        return clearSession('Logged out from WhatsApp. Session cleared. Open the pairing page to link again.');
      }

      if (code === DisconnectReason.badSession) {
        return clearSession(
          'Saved session is corrupt (code 500). Session cleared. Remove SESSION_ID in your host dashboard, then pair again.'
        );
      }

      console.log('Reconnecting in 5s...');
      setTimeout(() => {
        if (gen === mainGen) startBot().catch(err => console.error('Restart failed:', err.message));
      }, 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      if (msg.key?.remoteJid === 'status@broadcast') {
        await handleStatus(sock, msg);
        await handleStatusSave(sock, msg);
        continue;
      }

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
              caption: `*View Once Opened*\nFrom: @${senderNum}`,
              mentions: [sender],
            });
          }
          if (viewOnceMsg.videoMessage) {
            await sock.sendMessage(msg.key.remoteJid, {
              video: { url: viewOnceMsg.videoMessage.url },
              mimetype: viewOnceMsg.videoMessage.mimetype,
              caption: `*View Once Opened*\nFrom: @${senderNum}`,
              mentions: [sender],
            });
          }
        } catch (e) {
          console.error('viewonce error:', e.message);
        }
      }

      cacheMessage(msg);

      const myJid = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
      if (msg.key.fromMe && msg.key.remoteJid !== myJid) continue;

      await handleMessage(sock, msg);
    }
  });

  sock.ev.on('messages.update', async updates => {
    const deleted = updates.filter(u =>
      u.update?.messageStubType === 1 ||
      u.update?.message === null
    );
    if (deleted.length) await handleDelete(sock, deleted);
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const { welcomeEnabled } = require('./commands/welcome');
      const { goodbyeEnabled } = require('./commands/goodbye');
      for (const jid of participants) {
        const num = jid.split('@')[0];
        if (action === 'add' && welcomeEnabled[id]) {
          await sock.sendMessage(id, {
            text: `*Welcome to the group!*\n\n@${num} has joined!`,
            mentions: [jid],
          });
        }
        if (action === 'remove' && goodbyeEnabled[id]) {
          await sock.sendMessage(id, {
            text: `*Goodbye!*\n\n@${num} has left the group.`,
            mentions: [jid],
          });
        }
      }
    } catch (e) {}
  });
}

// ── startup ───────────────────────────────────────────────────────

// Scheduled reminders run once per process and use whichever connection is live.
loadReminders();
cron.schedule('* * * * *', () => {
  if (mainSock && botPaired) {
    checkReminders(mainSock).catch(err => console.error('Reminder error:', err.message));
  }
});

pairing.init({
  getVersion: () => version,
  isBotPaired: () => botPaired,
  onLinked: async pairDir => {
    if (botPaired) {
      throw new Error('The bot was already linked by another pairing.');
    }
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    // Move, don't copy: the keys stay exactly as WhatsApp wrote them.
    fs.renameSync(pairDir, AUTH_DIR);
    console.log('✅ Linked successfully. Waiting 5s for WhatsApp to finish registering this device...');
    await sleep(5000);
    console.log('Starting the bot...');
    await startBot();
    console.log('Keep it running for a few minutes. If it stays connected, set SESSION_ID now.');
  },
});

async function boot() {
  try {
    if (!version) {
      try {
        ({ version } = await fetchLatestBaileysVersion());
      } catch (e) {
        console.warn('Could not fetch the latest Baileys version, using the default:', e.message);
      }
    }
    await startBot();
  } catch (err) {
    console.error('Startup failed, retrying in 30s:', err.message);
    setTimeout(boot, 30000);
  }
}

restoreSession();
boot();
