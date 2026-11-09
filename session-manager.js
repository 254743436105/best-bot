const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUTH_DIR = path.join(__dirname, 'auth_info');
const SESSION_ENV = process.env.SESSION_ID || process.env.SESSION_DATA;

/**
 * Restore the archived auth files from SESSION_ID (or legacy SESSION_DATA).
 */
function restoreSession() {
  if (!SESSION_ENV) {
    console.log('ℹ️  No SESSION_ID env var — will show QR code.');
    return;
  }

  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    const tarPath = path.join(__dirname, 'auth.tar.gz');
    fs.writeFileSync(tarPath, Buffer.from(SESSION_ENV, 'base64'));
    execSync(`tar -xzf "${tarPath}" -C "${path.dirname(AUTH_DIR)}"`);
    fs.unlinkSync(tarPath);
    console.log('✅ Session restored from SESSION_ID.');
  } catch (e) {
    console.error('⚠️  Failed to restore session:', e.message);
  }
}

/**
 * Persist auth files into the process environment for local/self-hosted use.
 * Hosted environment variables must be updated through the hosting dashboard.
 */
function persistSession() {
  try {
    const tarPath = path.join(__dirname, 'auth.tar.gz');
    execSync(`tar -czf "${tarPath}" -C "${path.dirname(AUTH_DIR)}" auth_info`);
    const b64 = fs.readFileSync(tarPath).toString('base64');
    fs.unlinkSync(tarPath);
    process.env.SESSION_ID = b64;
  } catch (e) {
    // non-fatal
  }
}

module.exports = { restoreSession, persistSession };
