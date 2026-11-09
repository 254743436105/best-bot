// src/pairing/pair-manager.js
// Each pairing request gets its own temporary WhatsApp connection and auth folder.
// A code or QR stays valid while its connection lives. When one session links,
// its credentials become the bot's session and the other sessions are cancelled.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pino = require('pino');
const QRCode = require('qrcode');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const PAIR_DIR = path.join(process.cwd(), 'pair_sessions');
const MAX_ACTIVE = Number(process.env.PAIR_MAX_ACTIVE) || 5;
const SESSION_TTL_MS = 5 * 60 * 1000;
const KEEP_FINISHED_MS = 10 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_PER_IP = 10;
const MAX_RESTARTS = 5;

// Default: "Mac OS|Safari|10.15.7". To try another browser, set PAIR_BROWSER,
// for example "Ubuntu|Chrome|20.0.04".
const PAIR_BROWSER = (process.env.PAIR_BROWSER || 'Mac OS|Safari|10.15.7')
  .split('|')
  .map(part => part.trim());

const ACTIVE = new Set(['starting', 'waiting']);
const FINAL = new Set(['linked', 'failed', 'expired', 'cancelled']);

const sessions = new Map();
const ipHits = new Map();
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
  removeDir(PAIR_DIR); // clear leftovers from an earlier run
  fs.mkdirSync(PAIR_DIR, { recursive: true });
  setInterval(cleanup, 30 * 1000).unref();
}

function activeCount() {
  let count = 0;
  for (const s of sessions.values()) if (ACTIVE.has(s.status)) count += 1;
  return count;
}

function rateOk(ip) {
  const now = Date.now();
  const hit = ipHits.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > hit.resetAt) {
    hit.count = 0;
    hit.resetAt = now + RATE_WINDOW_MS;
  }
  if (hit.count >= RATE_MAX_PER_IP) return false;
  hit.count += 1;
  ipHits.set(ip, hit);
  return true;
}

async function createSession({ type, phone = null, ip = 'unknown' }) {
  if (deps.isBotPaired()) throw httpError(409, 'This bot is already paired.');
  if (activeCount() >= MAX_ACTIVE) {
    throw httpError(429, `Too many active pairings (limit ${MAX_ACTIVE}). Wait a few minutes or cancel one.`);
  }
  if (!rateOk(ip)) {
    throw httpError(429, 'Too many requests from your network. Try again in a few minutes.');
  }

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
    sock.ev.on('connection.update', update => onUpdate(session, sock, state, update));

    if (session.type === 'code') requestCode(session, sock, state);
  } catch (err) {
    fail(session, `Could not start pairing: ${err.message}`);
  }
}

async function onUpdate(session, sock, state, { connection, lastDisconnect, qr }) {
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

  if (state.creds.registered || connection === 'open') {
    return finishLink(session, sock);
  }

  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code === DisconnectReason.loggedOut) {
      return fail(session, 'WhatsApp ended this pairing. Start a new one.');
    }
    if (session.restarts >= MAX_RESTARTS) {
      return fail(session, 'Could not reach WhatsApp. Start a new pairing.');
    }
    session.restarts += 1;
    session.sock = null;
    session.status = 'starting';
    if (session.type === 'code') session.code = null; // a fresh code is requested on restart
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
    await sleep(2000); // let WhatsApp finish writing keys to disk
    try { sock.end(undefined); } catch {}
    await sleep(500);

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
  MAX_ACTIVE,
  PAIR_BROWSER,
};
