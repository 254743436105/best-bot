// src/pairing/pair-manager.js
// Each pairing request gets its own temporary WhatsApp connection and auth folder.
// After the code is entered, WhatsApp sends 515 (restartRequired). The client must
// reconnect with the same credentials to finish registering the device. Linking is
// complete only when that reconnected socket opens. Then the credentials are moved
// into the bot's session, and the other pairings are cancelled.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pino = require('pino');
const QRCode = require('qrcode');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const PAIR_DIR = path.join(process.cwd(), 'pair_sessions');
const SESSION_TTL_MS = 5 * 60 * 1000;    // how long a code or QR stays usable
const KEEP_FINISHED_MS = 10 * 60 * 1000; // how long finished entries stay visible
const MAX_RESTARTS = 5;                  // reconnects allowed per pairing

// Default browser identity. Override with PAIR_BROWSER, e.g. "Ubuntu|Chrome|22.04.4".
const PAIR_BROWSER = (process.env.PAIR_BROWSER || 'Mac OS|Safari|10.15.7')
  .split('|')
  .map((part) => part.trim());

// 'linking' = code entered or QR scanned, waiting for WhatsApp to finish registration
const ACTIVE = new Set(['starting', 'waiting', 'linking']);
const FINAL = new Set(['linked', 'failed', 'expired', 'cancelled']);

const sessions = new Map();
let deps = null; // { getVersion, isBotPaired, onLinked }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

function init(options) {
  deps = options;
  removeDir(PAIR_DIR);
  fs.mkdirSync(PAIR_DIR, { recursive: true });
  setInterval(cleanup, 30 * 1000).unref();
}

function activeCount() {
  let count = 0;
  for (const s of sessions.values()) if (ACTIVE.has(s.status)) count += 1;
  return count;
}

async function createSession({ type, phone = null }) {
  if (deps.isBotPaired()) {
    throw httpError(
      409,
      'The bot is already connected to WhatsApp. Pairing is turned off until SESSION_ID is removed and the bot restarts.'
    );
  }

  const id = crypto.randomBytes(8).toString('hex');
  const session = {
    id,
    type,                  // 'code' or 'qr'
    phone,
    status: 'starting',    // starting | waiting | linking | linked | failed | expired | cancelled
    code: null,
    qr: null,
    error: null,
    expiresAt: Date.now() + SESSION_TTL_MS,
    dir: path.join(PAIR_DIR, id),
    sock: null,
    saveCreds: null,
    restarts: 0,
    finishing: false,
  };
  sessions.set(id, session);
  startSocket(session, type === 'code');
  return session;
}

function getSession(id) {
  return sessions.get(id) || null;
}

function cancelSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  if (ACTIVE.has(session.status)) stop(session, 'cancelled');
  return session;
}

function view(s) {
  return {
    id: s.id,
    type: s.type,
    status: s.status,
    phone: s.phone,
    code: s.code,
    qr: s.qr,
    error: s.error,
    expiresAt: s.expiresAt,
  };
}

// Creates a socket on this session's folder. Events from older sockets are ignored.
async function startSocket(session, withCode) {
  if (FINAL.has(session.status)) return;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(session.dir);
    session.saveCreds = saveCreds;
    const version = deps.getVersion();

    const sock = makeWASocket({
      ...(version ? { version } : {}),
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: PAIR_BROWSER,
      getMessage: async () => ({ conversation: '' }),
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
      retryRequestDelayMs: 250,
    });

    session.sock = sock;
    sock.ev.on('creds.update', () => saveCreds().catch(() => {}));
    sock.ev.on('connection.update', (update) => {
      if (session.sock !== sock) return; // a newer socket replaced this one
      onUpdate(session, sock, update).catch((e) => console.error(`[${session.id}] update error:`, e.message));
    });

    if (withCode) requestCode(session, sock, state);
  } catch (err) {
    fail(session, `Could not start pairing: ${err.message}`);
  }
}

// Replaces the socket on the same folder. Used after 515 and after transient drops.
async function restartSocket(session, withCode) {
  if (FINAL.has(session.status)) return;
  if (session.restarts >= MAX_RESTARTS) {
    return fail(session, 'Could not reach WhatsApp. Start a new pairing.');
  }
  session.restarts += 1;

  const old = session.sock;
  session.sock = null; // events from the old socket are ignored from now on
  try { old?.end(undefined); } catch {}

  await sleep(2000);
  if (FINAL.has(session.status)) return;
  await startSocket(session, withCode);
}

async function onUpdate(session, sock, { connection, lastDisconnect, qr }) {
  if (session.sock !== sock || FINAL.has(session.status)) return;

  if (qr && session.type === 'qr') {
    session.qr = await QRCode.toDataURL(qr, {
      margin: 1,
      width: 260,
      color: { dark: '#0b1e3f', light: '#ffffff' },
    });
    session.status = 'waiting';
    session.error = null;
  }

  if (connection === 'open') {
    return finishLink(session, sock);
  }

  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    console.log(`[${session.id}] connection closed, code=${code}, status=${session.status}`);

    if (code === DisconnectReason.loggedOut) {
      return fail(session, 'WhatsApp rejected this pairing. Start a new one.');
    }

    // 515: the code or QR was accepted. Reconnect with the same credentials to finish.
    if (code === DisconnectReason.restartRequired) {
      session.status = 'linking';
      session.code = null;
      session.qr = null;
      return restartSocket(session, false);
    }

    // Any other drop. Before the code is entered, a new code is needed. While linking, reconnect as is.
    const linking = session.status === 'linking';
    session.status = linking ? 'linking' : 'starting';
    if (!linking) {
      session.code = null;
      session.qr = null;
    }
    return restartSocket(session, !linking && session.type === 'code');
  }
}

async function requestCode(session, sock, state) {
  await sleep(2500); // give the socket time to reach the handshake
  let lastError = 'unknown error';

  for (let attempt = 1; attempt <= 4; attempt++) {
    if (session.sock !== sock || FINAL.has(session.status) || state.creds.registered) return;
    try {
      session.code = await sock.requestPairingCode(session.phone);
      session.status = 'waiting';
      session.error = null;
      console.log(`[${session.id}] pairing code issued`);
      return;
    } catch (err) {
      lastError = err.message;
      await sleep(3000);
    }
  }

  if (session.sock === sock && !session.code) {
    fail(session, `WhatsApp did not return a code (${lastError}). Check the number and try again.`);
  }
}

// Called only when the reconnected socket opens, which means registration is complete.
async function finishLink(session, sock) {
  if (session.finishing) return;
  session.finishing = true;

  // Only the first pairing may become the bot's account.
  if (deps.isBotPaired()) {
    try { sock.end(undefined); } catch {}
    return stop(
      session,
      'failed',
      'The bot is already linked. Remove SESSION_ID and restart the bot to pair a different number.'
    );
  }

  session.status = 'linked';
  session.code = null;
  session.qr = null;
  console.log(`[${session.id}] linked`);

  try {
    await session.saveCreds?.();
    try { sock.end(undefined); } catch {}
    await sleep(1500); // let the socket close and the files settle

    // Stop every other pairing before the bot starts, so only one device registers.
    for (const other of sessions.values()) {
      if (other.id !== session.id && ACTIVE.has(other.status)) stop(other, 'cancelled');
    }

    // deps.onLinked moves this folder into auth_info and starts the bot.
    await deps.onLinked(session.dir);
  } catch (err) {
    console.error('Linking failed:', err.message);
    session.status = 'failed';
    session.error = `Linked, but saving the session failed: ${err.message}`;
  }
}

function stop(session, status, error = null) {
  session.status = status;
  if (error) session.error = error;
  try { session.sock?.end(undefined); } catch {}
  session.sock = null;
  setTimeout(() => removeDir(session.dir), 1000).unref();
}

function fail(session, message) {
  if (FINAL.has(session.status)) return;
  stop(session, 'failed', message);
}

function cleanup() {
  const now = Date.now();
  for (const s of sessions.values()) {
    if (ACTIVE.has(s.status) && s.status !== 'linking' && now > s.expiresAt) {
      stop(s, 'expired', 'This code or QR expired. Generate a new one.');
    }
    if (FINAL.has(s.status) && now > s.expiresAt + KEEP_FINISHED_MS) {
      sessions.delete(s.id);
    }
  }
}

module.exports = {
  init,
  createSession,
  getSession,
  cancelSession,
  view,
  activeCount,
  PAIR_BROWSER,
};
