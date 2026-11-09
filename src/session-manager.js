const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = process.cwd();
const AUTH_DIR = path.join(ROOT_DIR, 'auth_info');

// Format: base64 of a gzipped tar containing auth_info/ (starts with "H4sI")
function restoreArchive(data) {
  if (!data.startsWith('H4sI')) return false;
  const tarPath = path.join(os.tmpdir(), `auth-${process.pid}-${Date.now()}.tar.gz`);
  fs.writeFileSync(tarPath, Buffer.from(data.replace(/\s/g, ''), 'base64'));
  try {
    // execFileSync takes an argument array, so no shell is involved
    execFileSync('tar', ['-xzf', tarPath, '-C', ROOT_DIR]);
  } finally {
    fs.rmSync(tarPath, { force: true });
  }
  return fs.existsSync(path.join(AUTH_DIR, 'creds.json'));
}

// Format: Baileys session string (XMD / XMDIA prefix, base64 of creds.json)
function restoreXmdia(data) {
  if (!data.startsWith('XMD')) return false;
  const json = Buffer.from(data, 'base64').toString('utf8');
  JSON.parse(json); // throws if it isn't valid creds
  fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), json);
  return true;
}

// Format: JSON object mapping filename -> base64 of file contents
function restoreMultiFile(data) {
  const parsed = JSON.parse(data);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;

  // Validate everything before writing anything
  const files = Object.entries(parsed).map(([name, value]) => {
    if (typeof value !== 'string') throw new Error('bad value');
    const contents = Buffer.from(value, 'base64').toString('utf8');
    JSON.parse(contents);
    return [path.basename(name), contents];
  });

  for (const [name, contents] of files) {
    fs.writeFileSync(path.join(AUTH_DIR, name), contents);
  }
  return files.length > 0;
}

// Format: base64 of creds.json
function restoreBase64Creds(data) {
  const json = Buffer.from(data.replace(/\s/g, ''), 'base64').toString('utf8');
  JSON.parse(json);
  fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), json);
  return true;
}

// Format: raw creds.json
function restoreRawJson(data) {
  JSON.parse(data);
  fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), data);
  return true;
}

const FORMATS = [
  ['archive', restoreArchive],
  ['XMDIA', restoreXmdia],
  ['multi-file', restoreMultiFile],
  ['base64 creds', restoreBase64Creds],
  ['raw JSON', restoreRawJson],
];

function restoreSession() {
  // SESSION_ID is the current name; SESSION_DATA is kept as a migration fallback.
  const data = (process.env.SESSION_ID || process.env.SESSION_DATA || '').trim();
  if (!data) {
    console.log('ℹ️ No SESSION_ID found — scan the QR code.');
    return false;
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  for (const [label, restore] of FORMATS) {
    try {
      if (restore(data)) {
        console.log(`✅ Session restored from SESSION_ID (${label}).`);
        return true;
      }
    } catch {
      // not this format; try the next one
    }
  }

  console.error('⚠️ SESSION_ID format not recognized.');
  return false;
}

// Hosted environment variables can't be written from inside the app,
// so this stays a no-op. Update SESSION_ID in the host dashboard instead.
function saveSession() {}

module.exports = { restoreSession, saveSession };
