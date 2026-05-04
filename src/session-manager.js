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
    // Try multi-file JSON format first
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && !parsed.noiseKey) {
        Object.keys(parsed).forEach(filename => {
          const buf = Buffer.from(parsed[filename], 'base64');
          fs.writeFileSync(path.join(AUTH_DIR, filename), buf);
        });
        console.log('✅ Session restored from SESSION_DATA (multi-file).');
        return;
      }
    } catch {}
    // Try base64 creds.json
    try {
      const json = Buffer.from(data.replace(/\s/g, ''), 'base64').toString('utf8');
      JSON.parse(json); // validate
      fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), json);
      console.log('✅ Session restored from SESSION_DATA (base64).');
      return;
    } catch {}
    // Try raw JSON
    try {
      JSON.parse(data);
      fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), data);
      console.log('✅ Session restored from SESSION_DATA (raw JSON).');
      return;
    } catch {}
    console.error('⚠️ SESSION_DATA format not recognized.');
  } catch (err) {
    console.error('⚠️ Failed to restore session:', err.message);
  }
}

function saveSession() {}
module.exports = { restoreSession, saveSession };
