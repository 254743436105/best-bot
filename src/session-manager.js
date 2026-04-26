const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUTH_DIR   = path.join(__dirname, 'auth_info');
const SESSION_ENV = process.env.SESSION_DATA;

/**
 * If SESSION_DATA env var is set, decode it (base64 tar.gz) and
 * extract into auth_info/ so Baileys can resume without QR scan.
 */
function restoreSession() {
  if (!SESSION_ENV) {
    console.log('ℹ️  No SESSION_DATA env var — will show QR code.');
    return;
  }

  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    const tarPath = path.join(__dirname, 'auth.tar.gz');
    fs.writeFileSync(tarPath, Buffer.from(SESSION_ENV, 'base64'));
    execSync(`tar -xzf "${tarPath}" -C "${path.dirname(AUTH_DIR)}"`);
    fs.unlinkSync(tarPath);

    console.log('✅ Session restored from SESSION_DATA.');
  } catch (e) {
    console.error('⚠️  Failed to restore session:', e.message);
  }
}

/**
 * After creds update, re-encode auth_info/ and save back to SESSION_DATA.
 * On Heroku/Render this is a no-op (env vars are read-only at runtime),
 * but the function is here for local or self-hosted use.
 */
function persistSession() {
  try {
    const tarPath = path.join(__dirname, 'auth.tar.gz');
    execSync(`tar -czf "${tarPath}" -C "${path.dirname(AUTH_DIR)}" auth_info`);
    const b64 = fs.readFileSync(tarPath).toString('base64');
    fs.unlinkSync(tarPath);
    // In production set SESSION_DATA manually via dashboard after first run
    process.env.SESSION_DATA = b64;
  } catch (e) {
    // non-fatal
  }
}

module.exports = { restoreSession, persistSession };
