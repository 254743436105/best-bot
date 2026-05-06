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

    // Format 1: XMDIA... (Baileys session string)
    if (data.startsWith('XMDIA') || data.startsWith('XMD')) {
      const decoded = Buffer.from(data, 'base64');
      fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), decoded);
      console.log('✅ Session restored from SESSION_DATA (XMDIA format).');
      return;
    }

    // Format 2: Multi-file JSON object
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        Object.keys(parsed).forEach(filename => {
          const buf = Buffer.from(parsed[filename], 'base64');
          fs.writeFileSync(path.join(AUTH_DIR, filename), buf);
        });
        console.log('✅ Session restored from SESSION_DATA (multi-file).');
        return;
      }
    } catch {}

    // Format 3: base64 encoded creds.json
    try {
      const json = Buffer.from(data.replace(/\s/g, ''), 'base64').toString('utf8');
      JSON.parse(json);
      fs.writeFileSync(path.join(AUTH_DIR, 'creds.json'), json);
      console.log('✅ Session restored from SESSION_DATA (base64).');
      return;
    } catch {}

    // Format 4: raw JSON
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
