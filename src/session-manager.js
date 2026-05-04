const fs = require('fs');
const path = require('path');
const ROOT_DIR = process.cwd();
const AUTH_DIR = path.join(ROOT_DIR, 'auth_info');

function restoreSession() {
  const data = process.env.SESSION_DATA;
  if (!data || data.trim() === '') {
    console.log('ℹ️ No SESSION_DATA found — scan the QR code.');
    return;
  }
  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    const parsed = JSON.parse(data);
    // Multi-file session format
    Object.keys(parsed).forEach(filename => {
      const buf = Buffer.from(parsed[filename], 'base64');
      fs.writeFileSync(path.join(AUTH_DIR, filename), buf);
    });
    console.log('✅ Session restored from SESSION_DATA (multi-file).');
  } catch {
    try {
      // Fallback: single creds.json base64
      const json = Buffer.from(data.replace(/\s/g, ''), 'base64').toString('utf8');
      fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), json);
      console.log('✅ Session restored from SESSION_DATA (base64).');
    } catch (err) {
      console.error('⚠️ Failed to restore session:', err.message);
    }
  }
}

function saveSession() {}
module.exports = { restoreSession, saveSession };
