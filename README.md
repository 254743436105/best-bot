# 🤖 ADEZ NEXUS

---

## ⚡ One-Click Deploy to Heroku

1. Push this repo to your own GitHub account
2. Click the **Deploy to Heroku** button above
3. Fill in the config vars:
   - `SESSION_ID` — paste your session value here (see below)
   - `TIMEZONE` — e.g. `Africa/Nairobi`
   - `PREFIX` — default is `!`
4. Click **Deploy App** — done! ✅

---

## 🔑 How to Get Your SESSION_ID

Run the bot **once locally** to generate the session:

```bash
npm install
node src/index.js
```

Scan the QR code with WhatsApp. Once connected, create an archive of the auth files:

```bash
tar -czf auth.tar.gz auth_info/
base64 auth.tar.gz
```

Store the output as the `SESSION_ID` environment variable in your host dashboard. Treat it as a secret. The app accepts the old `SESSION_DATA` variable as a migration fallback, but use `SESSION_ID` for new deployments.

**On Windows** use Git Bash or WSL to run those commands.

---

## 💬 Commands

| Command | Description |
|---|---|
| `!help` | Show all commands |
| `!ping` | Check bot status |
| `!time` | Current date & time |
| `!weather <city>` | Live weather |
| `!remind 30m Call John` | Set a reminder |
| `!reminders` | List reminders |
| `!reminders del <id>` | Delete a reminder |
| `!calc 15% of 3000` | Calculator |
| `!play <song>` | Search & send audio |
| `!statusview on/off` | Toggle auto status view |
| `!joke` | Random joke |
| `!quote` | Inspirational quote |
| `!sticker` | Image → sticker (reply to image) |

---

## 🔄 Session Persistence

Set `SESSION_ID` in your host's environment settings to restore the bot's WhatsApp authentication after a restart. On Render, set the value in the service's **Environment** settings. Environment variables are not written back automatically by the app; store them securely.

---

## 📄 License
MIT
