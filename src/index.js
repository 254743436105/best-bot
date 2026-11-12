require('dotenv').config();

// Silence libsignal's per-message session dumps. They print key material to the logs.
// Must run before @whiskeysockets/baileys is loaded.
const SILENCED = ['Closing session', 'Opening session', 'Removing old closed session', 'Decrypted message with closed session'];
for (const method of ['log', 'info', 'warn']) {
  const original = console[method].bind(console);
  console[method] = (...args) => {
    if (typeof args[0] === 'string' && SILENCED.some((p) => args[0].startsWith(p))) return;
    original(...args);
  };
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pino = require('pino');
const cron = require('node-cron');
const { Boom } = require('@hapi/boom');
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  jidNormalizedUser,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');
const { handleMessage } = require('./handlers/messageHandler');
const { loadReminders, checkReminders } = require('./handlers/reminderHandler');
const { handleStatus } = require('./handlers/statusHandler');
const { handleStatusSave } = require('./handlers/statusSaveHandler');
const { cacheMessage, handleDelete } = require('./handlers/antideleteHandler');
const { restoreSession, saveSession } = require('./session-manager');
const pairing = require('./pairing/pair-manager');
const { isOwner, numberOf } = require('./lib/perms');
const { welcomeEnabled } = require('./commands/welcome');
const { goodbyeEnabled } = require('./commands/goodbye');

// ── Configuration (environment variables) ─────────────────────────

const env = process.env;
const PORT = env.PORT || 3000;
const BOT_NAME = 'ADEZ NEXUS';
const OWNER_NAME = env.OWNER_NAME || 'Arnold Adez';
const OWNER_CONTACT = env.OWNER_CONTACT || '';
const TIMEZONE = env.TIMEZONE || 'Africa/Nairobi';
const PREFIX_TEXT = env.PREFIX || '!';
const PUBLIC_MODE = (env.MODE || 'public').toLowerCase() === 'public'; // MODE=private: owners only
const ANTI_CALL = env.ANTI_CALL !== 'false';
const AUTO_READ = env.AUTO_READ !== 'false';
const STATUS_REACT_EMOJI = env.AUTO_STATUS_REACT === 'off' ? '' : (env.AUTO_STATUS_REACT || '💚');
const STARTUP_ALERT = env.STARTUP_ALERT !== 'false';
const GROUP_LINK = env.GROUP_LINK || '';     // optional, shown in the startup card
const CHANNEL_LINK = env.CHANNEL_LINK || ''; // optional, shown in the startup card
const RATE_MAX = Number(env.RATE_LIMIT_MAX) || 30; // commands per minute for non-owners
const RATE_WINDOW = 60 * 1000;
const [SEND_MIN, SEND_MAX] = parseRange(env.SEND_DELAY || '800-2500');

const AUTH_DIR = path.join(process.cwd(), 'auth_info');
const REJECTED_FILE = path.join(process.cwd(), 'data', 'rejected-session.txt');
const MAX_BAD_SESSION_RETRIES = 3;
const MAX_SENT = 1000;

function parseRange(value) {
  const m = String(value).match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return [0, 0];
  const a = Number(m[1]);
  const b = Number(m[2]);
  return [Math.min(a, b), Math.max(a, b)];
}

// ── State ─────────────────────────────────────────────────────────

let mainSock = null;    // the bot's live WhatsApp connection (null until paired)
let mainGen = 0;        // increments whenever the socket is replaced; old events are ignored
let botPaired = false;
let connected = false;
let halted = false;     // set when WhatsApp replaces or rejects the session; stops reconnects
let badRetries = 0;     // code-500 retries since the last successful connection
let announced = false;  // the startup card is sent once per process
let version;            // Baileys protocol version, fetched once at boot

const sentCache = new Map();  // messages we sent, for WhatsApp retry requests
const hits = new Map();       // sender -> command timestamps, for rate limiting

class RetryCache {
  constructor() { this.m = new Map(); }
  get(k) { return this.m.get(k); }
  set(k, v) { this.m.set(k, v); if (this.m.size > 5000) this.m.delete(this.m.keys().next().value); }
  del(k) { this.m.delete(k); }
  flushAll() { this.m.clear(); }
}
const retryCache = new RetryCache();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');

// Masked version for logs, so phone numbers don't sit in log history
function mask(jid = '') {
  const n = numberOf(jid);
  return n.length > 4 ? `${n.slice(0, 4)}****` : '****';
}

function detectHost() {
  if (env.RENDER) return 'Render';
  if (env.DYNO) return 'Heroku';
  if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID) return 'Railway';
  if (env.FLY_APP_NAME) return 'Fly.io';
  if (env.REPL_ID || env.REPL_SLUG) return 'Replit';
  if (process.platform === 'win32') return 'Windows PC';
  return process.platform === 'linux' ? 'VPS / Linux' : 'Local';
}

// ── Session files ─────────────────────────────────────────────────

function isPairedOnDisk() {
  try {
    const creds = JSON.parse(fs.readFileSync(path.join(AUTH_DIR, 'creds.json'), 'utf8'));
    return Boolean(creds.registered);
  } catch {
    return false;
  }
}

function sessionEnv() {
  return (env.SESSION_ID || env.SESSION_DATA || '').trim();
}

// A SESSION_ID that WhatsApp logged out is recorded, so restarts don't import it again.
function sessionWasRejected() {
  const raw = sessionEnv();
  if (!raw) return false;
  try {
    return fs.readFileSync(REJECTED_FILE, 'utf8').trim() === sha(raw);
  } catch {
    return false;
  }
}

function markSessionRejected() {
  const raw = sessionEnv();
  if (!raw) return;
  fs.mkdirSync(path.dirname(REJECTED_FILE), { recursive: true });
  fs.writeFileSync(REJECTED_FILE, sha(raw));
}

function endMainSocket() {
  mainGen += 1; // events from the old socket are ignored from now on
  if (mainSock) {
    try { mainSock.end(undefined); } catch {}
    mainSock = null;
  }
}

function clearSession(message) {
  markSessionRejected();
  endMainSocket();
  botPaired = false;
  connected = false;
  badRetries = 0;
  announced = false;
  fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  console.log(message);
}

// ── Sending ───────────────────────────────────────────────────────

function rememberSent(id, message) {
  sentCache.set(id, message);
  if (sentCache.size > MAX_SENT) sentCache.delete(sentCache.keys().next().value);
}

// Every outgoing message waits a random delay and is sent one at a time.
function wrapSend(sock) {
  const original = sock.sendMessage.bind(sock);
  let chain = Promise.resolve();
  sock.sendMessage = (...args) => {
    const run = chain.then(async () => {
      if (SEND_MAX > 0) await sleep(SEND_MIN + Math.random() * (SEND_MAX - SEND_MIN));
      const res = await original(...args);
      if (res?.key?.id && res.message) rememberSent(res.key.id, res.message);
      return res;
    });
    chain = run.catch(() => {});
    return run;
  };
}

function buildStartupCard(sock) {
  const time = new Date().toLocaleString('en-GB', { timeZone: TIMEZONE, dateStyle: 'medium', timeStyle: 'short' });
  const lines = [
    `┌──「 *✨ ${BOT_NAME}* 」`,
    `│ 🟢 Status   Online`,
    `│ 📱 Number   ${numberOf(sock.user.id)}`,
    `│ 🕒 Time     ${time}`,
    `│ 🌍 Host     ${detectHost()}`,
    `│ ⚙️ Mode     ${PUBLIC_MODE ? 'Public' : 'Private'}`,
    `│ ⌨️ Prefix   ${PREFIX_TEXT}`,
    `│ 🟢 Node     ${process.version}`,
    `└──────────────`,
    '',
    `Owner: ${OWNER_NAME}${OWNER_CONTACT ? `\nContact: ${OWNER_CONTACT}` : ''}`,
    `Type ${PREFIX_TEXT}help to see all commands.`,
  ];
  if (CHANNEL_LINK) lines.push(`📢 ${CHANNEL_LINK}`);
  if (GROUP_LINK) lines.push(`👥 ${GROUP_LINK}`);
  return lines.join('\n');
}

// ── Message handling ──────────────────────────────────────────────

function textOf(msg) {
  const m = msg.message || {};
  return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || '';
}

function rateLimited(sender) {
  const now = Date.now();
  const recent = (hits.get(sender) || []).filter((t) => now - t < RATE_WINDOW);
  recent.push(now);
  hits.set(sender, recent);
  return recent.length > RATE_MAX;
}
setInterval(() => {
  const now = Date.now();
  for (const [sender, times] of hits) {
    const recent = times.filter((t) => now - t < RATE_WINDOW);
    if (recent.length) hits.set(sender, recent);
    else hits.delete(sender);
  }
}, RATE_WINDOW).unref();

// Shows view-once photos and videos in the chat. The media is downloaded and decrypted first.
async function revealViewOnce(sock, msg) {
  const m = msg.message || {};
  const inner = m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m.viewOnceMessageV2Extension?.message;
  if (!inner || msg.key.fromMe) return;

  const kind = inner.imageMessage ? 'image' : inner.videoMessage ? 'video' : null;
  if (!kind) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  const buffer = await downloadMediaMessage({ key: msg.key, message: inner }, 'buffer', {});
  await sock.sendMessage(msg.key.remoteJid, {
    [kind]: buffer,
    mimetype: inner[`${kind}Message`].mimetype,
    caption: `*View Once Opened*\nFrom: @${numberOf(sender)}`,
    mentions: [sender],
  });
}

async function onMessage(sock, msg) {
  if (!msg.message) return;
  const jid = msg.key.remoteJid;

  if (jid === 'status@broadcast') {
    await handleStatus(sock, msg);
    await handleStatusSave(sock, msg);
    if (STATUS_REACT_EMOJI && !msg.key.fromMe && msg.key.participant) {
      setTimeout(() => {
        sock
          .sendMessage(
            'status@broadcast',
            { react: { key: msg.key, text: STATUS_REACT_EMOJI } },
            { statusJidList: [msg.key.participant, jidNormalizedUser(sock.user.id)] }
          )
          .catch(() => {});
      }, 2000 + Math.random() * 3000);
    }
    return;
  }

  const isGroup = jid.endsWith('@g.us');
  const myJid = jidNormalizedUser(sock.user.id);
  // Owner messages run in groups and in the owner's self-chat, not in other private chats.
  if (msg.key.fromMe && !isGroup && jid !== myJid) return;

  // Private mode: only owners get any response.
  if (!PUBLIC_MODE && !isOwner(msg)) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  if (!isOwner(msg) && textOf(msg).trim().startsWith(PREFIX_TEXT) && rateLimited(sender)) return;

  cacheMessage(msg);

  if (AUTO_READ) sock.readMessages([msg.key]).catch(() => {});
  await revealViewOnce(sock, msg).catch((e) => console.error('view once error:', e.message));
  await handleMessage(sock, msg);
}

// ── Connection lifecycle ──────────────────────────────────────────

function onOpen(sock) {
  connected = true;
  botPaired = true;
  badRetries = 0;
  console.log(`✅ ${BOT_NAME} connected as ${mask(sock.user.id)}`);
  saveSession();

  if (STARTUP_ALERT && !announced) {
    announced = true;
    setTimeout(() => {
      if (!connected) return;
      sock
        .sendMessage(jidNormalizedUser(sock.user.id), { text: buildStartupCard(sock) })
        .catch((e) => console.error('startup card failed:', e.message));
    }, 5000);
  }
}

function restartLater(gen, delayMs) {
  setTimeout(() => {
    if (gen === mainGen) startBot().catch((e) => console.error('Restart failed:', e.message));
  }, delayMs);
}

function onClose(gen, lastDisconnect) {
  connected = false;
  const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
  const reason = lastDisconnect?.error?.message || 'no details';
  console.log(`Connection closed (code ${code}): ${reason}`);

  if (code === DisconnectReason.loggedOut) {
    return clearSession('Logged out from WhatsApp. Session cleared. Open the pairing page to link again.');
  }

  if (code === DisconnectReason.connectionReplaced) {
    halted = true;
    endMainSocket();
    console.error('Another device took over this session (440). Reconnects stopped. Restart the service to take it back.');
    return;
  }

  if (code === DisconnectReason.badSession) {
    // A freshly linked device can be refused once while WhatsApp finishes registering it.
    // Keep the saved keys and retry with longer waits before giving up.
    badRetries += 1;
    if (badRetries > MAX_BAD_SESSION_RETRIES) {
      halted = true;
      endMainSocket();
      console.error('WhatsApp keeps rejecting this session (500). Reconnects stopped. Set a new SESSION_ID or pair again.');
      return;
    }
    const wait = 30000 * badRetries;
    console.log(`Session rejected (500). Keeping saved keys. Retry ${badRetries}/${MAX_BAD_SESSION_RETRIES} in ${wait / 1000}s...`);
    return restartLater(gen, wait);
  }

  console.log('Reconnecting in 5s...');
  restartLater(gen, 5000);
}

async function startBot() {
  if (halted) return;
  endMainSocket();
  connected = false;

  botPaired = isPairedOnDisk();
  if (!botPaired) {
    console.log('ℹ️ Not paired yet. Open the pairing page to link a WhatsApp number.');
    return;
  }

  const gen = mainGen;
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  console.log(`Starting ${BOT_NAME}${version ? ` (Baileys v${version.join('.')})` : ''}`);

  const sock = makeWASocket({
    ...(version ? { version } : {}),
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: pairing.PAIR_BROWSER,
    // Statuses come through as status@broadcast. Other broadcast lists are still ignored.
    shouldIgnoreJid: (jid) => isJidBroadcast(jid) && jid !== 'status@broadcast',
    getMessage: async (key) => sentCache.get(key.id) || undefined,
    msgRetryCounterCache: retryCache,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 250,
  });
  mainSock = sock;
  wrapSend(sock);

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    saveSession();
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (gen !== mainGen) return;
    if (connection === 'open') onOpen(sock);
    if (connection === 'close') onClose(gen, lastDisconnect);
  });

  sock.ev.on('call', async (calls) => {
    if (!ANTI_CALL) return;
    for (const c of calls) {
      if (c.status === 'offer') await sock.rejectCall(c.id, c.from).catch(() => {});
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' || gen !== mainGen) return;
    for (const msg of messages) {
      try {
        await onMessage(sock, msg);
      } catch (e) {
        console.error('handler error:', e.message);
      }
    }
  });

  sock.ev.on('messages.update', async (updates) => {
    if (gen !== mainGen) return;
    const deleted = updates.filter((u) => u.update?.messageStubType === 1 || u.update?.message === null);
    if (deleted.length) await handleDelete(sock, deleted);
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (gen !== mainGen) return;
    try {
      for (const p of participants) {
        const jid = typeof p === 'string' ? p : p.id;
        const n = numberOf(jid);
        if (action === 'add' && welcomeEnabled[id]) {
          await sock.sendMessage(id, { text: `*Welcome to the group!*\n\n@${n} has joined!`, mentions: [jid] });
        }
        if (action === 'remove' && goodbyeEnabled[id]) {
          await sock.sendMessage(id, { text: `*Goodbye!*\n\n@${n} has left the group.`, mentions: [jid] });
        }
      }
    } catch (e) {
      console.error('group event error:', e.message);
    }
  });
}

// ── Pairing page and API ──────────────────────────────────────────

const PAIR_PAGE = fs.readFileSync(path.join(__dirname, 'pairing', 'pair-page.html'), 'utf8');

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
  req.on('data', (chunk) => {
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
    handler(body).catch((err) => {
      if (err.status) return sendJson(res, err.status, { error: err.message });
      console.error('Request error:', err);
      sendJson(res, 500, { error: 'Something went wrong. Try again.' });
    });
  });
}

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
    return sendJson(res, 200, { paired: botPaired, connected, active: pairing.activeCount() });
  }

  if (req.method === 'POST' && (url === '/api/pair' || url === '/api/qr')) {
    return readJson(req, res, async (body) => {
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

server.listen(PORT, '0.0.0.0', () => console.log(`Pair page running on port ${PORT}`));

setInterval(() => {
  http.get(`http://localhost:${PORT}/health`, (res) => res.resume()).on('error', () => {});
}, 5 * 60 * 1000).unref();

// ── Startup ───────────────────────────────────────────────────────

loadReminders();
cron.schedule('* * * * *', () => {
  if (mainSock && connected) {
    checkReminders(mainSock).catch((e) => console.error('Reminder error:', e.message));
  }
});

pairing.init({
  getVersion: () => version,
  isBotPaired: () => botPaired,
  onLinked: async (pairDir) => {
    if (botPaired) throw new Error('The bot was already linked by another pairing.');
    halted = false;
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    fs.renameSync(pairDir, AUTH_DIR); // move, don't copy: the keys stay exactly as WhatsApp wrote them
    console.log('✅ Linked successfully. Waiting 5s for WhatsApp to finish registering this device...');
    await sleep(5000);
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

if (sessionWasRejected()) {
  console.log('This SESSION_ID was rejected by WhatsApp earlier. Set a new SESSION_ID to pair again.');
} else {
  restoreSession();
}
boot();

// Unexpected errors leave the process in an unknown state. Log the stack and exit,
// so the platform restarts the service cleanly.
process.on('uncaughtException', (e) => {
  console.error('uncaught:', e?.stack || e);
  process.exit(1);
});
process.on('unhandledRejection', (e) => console.error('unhandled:', e?.stack || e?.message || e));
