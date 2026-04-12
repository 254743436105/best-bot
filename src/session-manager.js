/**
 * session-manager.js
 *
 * Heroku's filesystem is ephemeral — auth_info/ is wiped on every dyno restart.
 * This module backs up the WhatsApp session to a Heroku-compatible store.
 *
 * Strategy used: encode the session folder as a base64 string stored in a
 * Heroku Config Var (SESSION_DATA). On startup we restore it; on credential
 * update we save it back.
 *
 * Set the Config Var via:
 *   heroku config:set SESSION_DATA="" --app your-app-name
 *
 * The variable will be populated automatically after the first QR scan.
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUTH_DIR     = path.resolve('./auth_info');
const ARCHIVE_PATH = path.resolve('./auth_info.tar.gz');

/**
 * Restore session from SESSION_DATA env var (base64-encoded tar.gz).
 */
function restoreSession() {
  const data = process.env.SESSION_DATA;
  if (!data || data.trim() === '') {
    console.log('ℹ️  No SESSION_DATA found — fresh start, scan the QR code.');
    return;
  }

  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    fs.writeFileSync(ARCHIVE_PATH, Buffer.from(data, 'base64'));
    execSync(`tar -xzf ${ARCHIVE_PATH} -C ./`);
    fs.unlinkSync(ARCHIVE_PATH);
    console.log('✅ Session restored from SESSION_DATA.');
  } catch (err) {
    console.error('⚠️  Failed to restore session:', err.message);
  }
}

/**
 * Save session to SESSION_DATA env var via Heroku CLI (if available).
 * Falls back to printing the value so you can set it manually.
 */
function saveSession() {
  try {
    if (!fs.existsSync(AUTH_DIR)) return;

    execSync(`tar -czf ${ARCHIVE_PATH} ${AUTH_DIR}`);
    const encoded = fs.readFileSync(ARCHIVE_PATH).toString('base64');
    fs.unlinkSync(ARCHIVE_PATH);

    // Try Heroku CLI
    const appName = process.env.HEROKU_APP_NAME;
    if (appName) {
      execSync(`heroku config:set SESSION_DATA="${encoded}" --app ${appName}`, {
        stdio: 'ignore',
      });
      console.log('💾 Session saved to Heroku config vars.');
    } else {
      // Print for manual copy-paste
      console.log('\n🔑 SESSION_DATA (copy this to your Heroku config vars):\n');
      console.log(encoded.substring(0, 80) + '... [truncated]');
      console.log('\nRun: heroku config:set SESSION_DATA="<value>" --app your-app-name\n');
    }
  } catch (err) {
    console.error('⚠️  Failed to save session:', err.message);
  }
}

module.exports = { restoreSession, saveSession };
