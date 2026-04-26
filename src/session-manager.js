const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR     = process.cwd();
const AUTH_DIR     = path.join(ROOT_DIR, 'auth_info');
const ARCHIVE_PATH = path.join(ROOT_DIR, 'auth_info.tar.gz');

function restoreSession() {
  const data = process.env.SESSION_DATA;
  if (!data || data.trim() === '') {
    console.log('ℹ️  No SESSION_DATA found — scan the QR code.');
    return;
  }
  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    // Strip whitespace/newlines from base64 string
    const buffer = Buffer.from(data.replace(/\s/g, ''), 'base64');
    fs.writeFileSync(ARCHIVE_PATH, buffer);
    execSync(`tar -xzf "${ARCHIVE_PATH}" -C "${ROOT_DIR}"`);
    fs.unlinkSync(ARCHIVE_PATH);
    console.log('✅ Session restored from SESSION_DATA.');
  } catch (err) {
    console.error('⚠️  Failed to restore session:', err.message);
  }
}

function saveSession() {
  // Managed manually via environment variables
}

module.exports = { restoreSession, saveSession };
