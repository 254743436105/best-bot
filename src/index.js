require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, isJidBroadcast } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { handleMessage } = require('./handlers/messageHandler');
const { loadReminders, checkReminders } = require('./handlers/reminderHandler');
const { handleStatus } = require('./handlers/statusHandler');
const { handleStatusSave } = require('./handlers/statusSaveHandler');
const { cacheMessage, handleDelete } = require('./handlers/antideleteHandler');
const { restoreSession, saveSession } = require('./session-manager');
const cron = require('node-cron');
const fs = require('fs');

const AUTH_DIR = './auth_info';
const PORT = process.env.PORT || 3000;
const BOT_NAME = 'ADEZ NEXUS';
const OWNER_NAME = 'Arnold Adez';
const OWNER_CONTACT = '+254111783552';
const OWNER_NUMBER = String(process.env.OWNER_NUMBER || '+254111783552').replace(/\D/g, '');
const PAIRING_SITE_TOKEN = process.env.PAIRING_SITE_TOKEN || '';

const BLUE_PAIR_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${BOT_NAME} Pairing</title>
  <style>
    :root {
      --bg: #071a2a;
      --bg2: #0d2c4a;
      --card: rgba(15, 42, 72, 0.88);
      --primary: #45b8ff;
      --primary-strong: #1b82d6;
      --accent: #7fe7ff;
      --text: #edf7ff;
      --muted: #bfd4e8;
      --danger: #ff5f7a;
      --success: #5de2a4;
      --border: rgba(130, 198, 255, 0.35);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, var(--bg), var(--bg2));
      color: var(--text);
      padding: 24px;
    }
    .card {
      width: min(100%, 980px);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 18px 60px rgba(4, 17, 31, 0.55);
      backdrop-filter: blur(8px);
    }
    .header {
      background: linear-gradient(135deg, rgba(55,140,220,0.85), rgba(23,70,123,0.9));
      padding: 22px 28px;
      border-bottom: 1px solid var(--border);
    }
    .header h1 { margin: 0; font-size: clamp(1.8rem, 3vw, 2.6rem); }
    .content {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 28px;
      padding: 28px;
    }
    .panel {
      background: rgba(8, 27, 44, 0.6);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
    }
    label {
      display: block;
      margin: 14px 0 8px;
      font-weight: 600;
      color: var(--muted);
    }
    input, button {
      width: 100%;
      border-radius: 12px;
      font: inherit;
    }
    input {
      background: rgba(12, 29, 45, 0.95);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 13px 14px;
      outline: none;
    }
    input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(69,184,255,0.18);
    }
    button {
      margin-top: 18px;
      padding: 14px 18px;
      border: 0;
      background: linear-gradient(135deg, var(--primary), var(--primary-strong));
      color: #041827;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.15s ease, filter 0.2s ease;
    }
    button:hover { filter: brightness(1.04); }
    button:active { transform: translateY(1px); }
    button:disabled {
      opacity: 0.7;
      cursor: wait;
    }
    .qr-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 290px;
    }
    #qrCanvas {
      width: min(260px, 75vw);
      height: min(260px, 75vw);
      border-radius: 18px;
      background: white;
      padding: 12px;
      box-shadow: 0 14px 25px rgba(0,0,0,0.25);
      display: none;
    }
    #result {
      margin-top: 18px;
      background: rgba(9, 26, 41, 0.8);
      border: 1px solid rgba(127,231,255,0.18);
      border-radius: 10px;
      padding: 12px 14px;
      color: var(--muted);
      min-height: 52px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .status-ok { color: var(--success); }
    .status-error { color: var(--danger); }
    .hint {
      margin-top: 12px;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.5;
    }
    @media (max-width: 760px) {
      .content { grid-template-columns: 1fr; }
      .card { width: min(100%, 560px); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${BOT_NAME}</h1>
    </div>
    <div class="content">
      <div class="panel">
        <h2>Pair a WhatsApp device</h2>
        <form id="pair-form">
          <label for="phone">WhatsApp number (international format)</label>
          <input id="phone" name="phone" inputmode="numeric" autocomplete="tel" placeholder="254..." required pattern="[0-9]{8,15}">
          <button id="submit" type="submit">Generate pairing code</button>
        </form>
        <div id="result" aria-live="polite">Ready to generate a pairing code.</div>
        <div class="hint">This page is limited to the owner number: +254111783552.</div>
      </div>
      <div class="panel qr-wrap">
        <canvas id="qrCanvas"></canvas>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.5.4/qrcode.min.js"></script>
  <script>
    const form = document.querySelector('#pair-form');
    const result = document.querySelector('#result');
    const qrCanvas = document.querySelector('#qrCanvas');

    function setResult(message, isError = false) {
      result.textContent = message;
      result.className = isError ? 'status-error' : 'status-ok';
    }

    function renderQr(data) {
      if (!window.qrcode || !qrCanvas) return;
      qrCanvas.style.display = 'block';
      const qr = qrcode(0, 'L');
      qr.addData(data);
      qr.make();
      const size = qrCanvas.width || 260;
      const ctx = qrCanvas.getContext('2d');
      qrCanvas.width = size;
      qrCanvas.height = size;
      ctx.clearRect(0, 0, size, size);
      const cell = Math.floor(size / qr.getModuleCount());
      for (let row = 0; row < qr.getModuleCount(); row++) {
        for (let col = 0; col < qr.getModuleCount(); col++) {
          ctx.fillStyle = qr.isDark(row, col) ? '#0f172a' : '#ffffff';
          ctx.fillRect(col * cell, row * cell, cell, cell);
        }
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = document.querySelector('#submit');
      button.disabled = true;
      result.textContent = 'Requesting a pairing code...';
      result.className = '';
      qrCanvas.style.display = 'none';

      try {
        const phone = document.querySelector('#phone').value.replace(/\D/g, '');
        const response = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await response.json();
        if (!response.ok) {
          setResult(data.error || 'Unable to create pairing code.', true);
          return;
        }
        const pairCode = data.code || '';
        setResult('Pairing code: ' + pairCode);
        if (pairCode) renderQr(pairCode);
      } catch (error) {
        setResult('Request failed. Please try again later.', true);
      } finally {
        button.disabled = false;
      }
    });
  </script>
</body>
</html>`;

const PAIRING_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${BOT_NAME} Pairing</title>
  <style>
    body{font:16px system-ui,sans-serif;background:#101827;color:#f4f7fb;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box}
    main{max-width:440px;width:100%;background:#1b2738;padding:28px;border-radius:16px;box-sizing:border-box}
    h1{margin-top:0;color:#7ce0bd}label{display:block;margin:16px 0 6px}input,button{box-sizing:border-box;width:100%;padding:12px;border-radius:8px;border:1px solid #526177;font:inherit}
    input{background:#101827;color:#fff}button{margin-top:18px;background:#25b989;color:#07130f;border:0;font-weight:700;cursor:pointer}button:disabled{opacity:.6;cursor:wait}
    #result{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:18px}.hint{color:#bdc8d8;font-size:.9rem}
  </style>
</head>
<body><main>
  <h1>${BOT_NAME}</h1>
  <p>Generate a WhatsApp pairing code for the account you own or are authorized to link.</p>
  <form id="pair-form">
    <label for="phone">WhatsApp phone number (international format, digits only)</label>
    <input id="phone" name="phone" inputmode="numeric" autocomplete="tel" placeholder="254..." required pattern="[0-9]{8,15}">
    <button id="submit" type="submit">Generate pairing code</button>
  </form>
  <p class="hint">This pairing form is limited to the owner number: +254111783552.</p>
  <div id="result" role="status" aria-live="polite"></div>
</main>
<script>
  const form=document.querySelector('#pair-form'), button=document.querySelector('#submit'), result=document.querySelector('#result');
  form.addEventListener('submit',async event=>{
    event.preventDefault(); button.disabled=true; result.textContent='Requesting a pairing code…';
    try{
      const phone = form.phone.value.replace(/\D/g, '');
      const response=await fetch('/api/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
      const data=await response.json(); result.textContent=response.ok?'Pairing code: '+data.code:(data.error||'Unable to create pairing code.');
    }catch{result.textContent='Request failed. Please try again later.'}
    finally{button.disabled=false}
  });
</script></body></html>`;

let pairingSocket = null;
let pairingRegistered = false;
let lastPairingRequestAt = 0;
const pairingAttempts = new Map();

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET' && (req.url === '/pair' || req.url === '/pair.html')) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    });
    return res.end(BLUE_PAIR_PAGE);
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`${BOT_NAME} is running`);
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    });
    return res.end(PAIRING_PAGE);
  }

  if (req.method !== 'POST' || req.url !== '/api/pair') {
    return sendJson(res, 404, { error: 'Not found.' });
  }

  if (PAIRING_SITE_TOKEN && PAIRING_SITE_TOKEN.length >= 32) {
    const suppliedToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!suppliedToken) {
      return sendJson(res, 401, { error: 'Unauthorized.' });
    }
    const expected = Buffer.from(PAIRING_SITE_TOKEN);
    const supplied = Buffer.from(suppliedToken);
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return sendJson(res, 401, { error: 'Unauthorized.' });
    }
  }

  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attempts = pairingAttempts.get(ip) || { count: 0, resetAt: now + 10 * 60 * 1000 };
  if (now > attempts.resetAt) {
    attempts.count = 0;
    attempts.resetAt = now + 10 * 60 * 1000;
  }
  if (attempts.count >= 5) return sendJson(res, 429, { error: 'Too many requests. Try again later.' });

  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
    if (rawBody.length > 2048) req.destroy();
  });
  req.on('end', async () => {
    let body;
    try { body = JSON.parse(rawBody); } catch { return sendJson(res, 400, { error: 'Invalid request.' }); }
    const phone = String(body.phone || '').replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(phone)) return sendJson(res, 400, { error: 'Enter a valid phone number in international format.' });
    if (phone !== OWNER_NUMBER) return sendJson(res, 403, { error: 'Only the owner number is allowed to pair this bot.' });
    if (!pairingSocket) return sendJson(res, 503, { error: 'Bot is still starting. Try again shortly.' });
    if (pairingRegistered) return sendJson(res, 409, { error: 'This bot is already paired. Clear its session before pairing another account.' });
    if (now - lastPairingRequestAt < 60 * 1000) return sendJson(res, 429, { error: 'Please wait one minute before requesting another code.' });

    attempts.count += 1;
    pairingAttempts.set(ip, attempts);
    lastPairingRequestAt = now;
    try {
      const code = await pairingSocket.requestPairingCode(phone);
      return sendJson(res, 200, { code });
    } catch (error) {
      console.error('Pairing code request failed:', error.message);
      return sendJson(res, 500, { error: 'Could not generate a pairing code. Check the number and try again later.' });
    }
  });
});
server.listen(PORT, () => console.log(`HTTP server listening on port ${PORT}`));

setInterval(() => {
  http.get(`http://localhost:${PORT}/health`, () => {});
}, 5 * 60 * 1000);

async function startBot() {
  restoreSession();
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  pairingRegistered = Boolean(state.creds.registered);

  console.log(`Starting ${BOT_NAME} (Baileys v${version.join('.')})`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['Mac OS', 'Safari', '17.4'],
    getMessage: async () => ({ conversation: '' }),
    shouldIgnoreJid: jid => isJidBroadcast(jid),
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 250,
  });
  pairingSocket = sock;

  sock.ev.on('creds.update', async () => {
    pairingRegistered = Boolean(state.creds.registered);
    await saveCreds();
    saveSession();
  });

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log(`\nScan this QR code with WhatsApp for ${BOT_NAME}:\n`);
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`Connection closed (code ${code}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        const delay = code === 500 ? 120000 : 5000;
        console.log(`Waiting ${delay / 1000}s before reconnecting...`);
        setTimeout(startBot, delay);
      } else {
        pairingRegistered = false;
        console.log('Logged out. Clear SESSION_DATA and restart.');
      }
    }
    if (connection === 'open') {
      pairingRegistered = true;
      console.log(`${BOT_NAME} connected! Send !help to test.`);
      saveSession();
      try {
        const myJid = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
        await sock.sendMessage(myJid, {
          text: `*Connected by Arnold Adez*\n\nBot is online and ready!\n\n_Type !help to see all commands_`
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

  sock.ev.on('messages.update', async (updates) => {
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

  loadReminders();
  cron.schedule('* * * * *', () => checkReminders(sock));
}

startBot().catch(console.error);
