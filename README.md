# 🤖 WhatsApp Personal Assistant Bot





| **Heroku** | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://dashboard.heroku.com/new?button-url=https://github.com/254743436105/best-botMD&template=https://github.com/254743436105/best-bot) 



---

## ⚡ One-Click Deploy to Heroku

1. Push this repo to your own GitHub account
2. Click the **Deploy to Heroku** button above
3. Fill in the config vars:
   - `SESSION_DATA` — paste your session ID here (see below)
   - `TIMEZONE` — e.g. `Africa/Nairobi`
   - `PREFIX` — default is `!`
4. Click **Deploy App** — done! ✅

---

## 🔑 How to Get Your SESSION_DATA

Run the bot **once locally** to generate the session:

```bash
npm install
node src/index.js
```

Scan the QR code with WhatsApp. Once connected, run:

```bash
tar -czf auth.tar.gz auth_info/
base64 auth.tar.gz
```

Copy the output and paste it as the `SESSION_DATA` config var on Heroku.

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

After the first QR scan the session is saved automatically to the `SESSION_DATA`
config var — so the bot reconnects on its own after every dyno restart.

If you ever get logged out, clear `SESSION_DATA` in Heroku Settings → Config Vars
and restart the dyno.

---

## 📄 License
MIT
