// src/pairing/pair-manager.js
// Each pairing request gets its own temporary WhatsApp connection and auth folder.
// Linking completes when WhatsApp sends a restart (515) or the socket opens.
// The credentials are flushed to disk, then copied into the bot's session.
// The first pairing that links becomes the bot's account; the others are cancelled.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pino = require('pino');
const QRCode = require('qrcode');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const PAIR_DIR = path.join(process.cwd(), 'pair_sessions');
const SESSION_TTL_MS = 5 * 60 * 1000;   // how long a code or QR stays usable
const KEEP_FINISHED_MS = 10 * 60 * 1000; // how long finished entries stay visible
const MAX_RESTARTS = 5;

// Default browser identity. Override with PAIR_BROWSER, e.g. "Ubuntu|Chrome|20.0.04".
const PAIR_BROWSER = (process.env.PAIR_BROWSER || 'Mac OS|Safari|10.15.7')
  .split('|')
  .map(part => part.trim());

const ACTIVE = new Set(['starting', 'waiting']);
const FINAL = new Set(['linked', 'failed', 'expired', 'cancelled']);

const sessions = new Map();
let deps = null; // { getVersion, isBotPaired, onLinked }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
  if (deps.isBotPaired()) throw httpError(409, 'This bot is already paired.');

  const id = crypto.randomBytes(8).toString('hex');
  const session = {
    id,
    type,                  // 'code' or 'qr'
    phone,
    status: 'starting',    // starting | waiting | linked | failed | expired | cancelled
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
  startSocket(session);
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

async function startSocket(session) {
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
    sock.ev.on('connection.update', update => onUpdate(session, sock, update));

    if (session.type === 'code') requestCode(session, sock, state);
  } catch (err) {
    fail(session, `Could not start pairing: ${err.message}`);
  }
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

    // 515 (restartRequired) is WhatsApp's signal that the link succeeded.
    if (code === DisconnectReason.restartRequired) {
      return finishLink(session, sock);
    }

    if (code === DisconnectReason.loggedOut) {
      return fail(session, 'WhatsApp rejected this pairing. Start a new one.');
    }

    if (session.restarts >= MAX_RESTARTS) {
      return fail(session, 'Could not reach WhatsApp. Start a new pairing.');
    }

    session.restarts += 1;
    session.sock = null;
    session.status = 'starting';
    session.code = null; // a fresh code is requested after the restart
    session.qr = null;
    setTimeout(() => startSocket(session), 3000);
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

async function finishLink(session, sock) {
  if (session.finishing) return;
  session.finishing = true;
  session.status = 'linked';
  session.code = null;
  session.qr = null;

  try {
    // Write every pending key and credential to disk before copying anything.
    await session.saveCreds?.();
    await sleep(1000);

    // Close this pairing connection so only the bot's own connection uses the credentials.
    try { sock.end(undefined); } catch {}
    await sleep(2000);

    await deps.onLinked(session.dir);
    removeDir(session.dir);

    for (const other of sessions.values()) {
      if (other.id !== session.id && ACTIVE.has(other.status)) stop(other, 'cancelled');
    }
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
    if (ACTIVE.has(s.status) && now > s.expiresAt) {
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
