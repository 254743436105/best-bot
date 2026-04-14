const PREFIX = process.env.PREFIX || '!';

module.exports = async (sock, msg, args, from) => {
  const text = `
🤖 *Personal Assistant Bot*
━━━━━━━━━━━━━━━━━━━━

📋 *General*
• \`${PREFIX}alive\` — Bot status & uptime
• \`${PREFIX}ping\` — Check response
• \`${PREFIX}time\` — Current date & time
• \`${PREFIX}help\` — This menu

🌤️ *Weather*
• \`${PREFIX}weather <city>\` — Current weather
• \`${PREFIX}forecast <city>\` — 5-day forecast

📰 *Info & Search*
• \`${PREFIX}news <topic>\` — Latest news
• \`${PREFIX}define <word>\` — Dictionary
• \`${PREFIX}translate <lang> <text>\` — Translate
  _e.g. !translate sw Hello_

💱 *Finance*
• \`${PREFIX}convert <amount> <from> <to>\`
  _e.g. !convert 100 USD KES_

⏰ *Reminders*
• \`${PREFIX}remind <time> <msg>\`
  _e.g. !remind 30m Call John_
• \`${PREFIX}reminders\` — List reminders
• \`${PREFIX}reminders del <id>\` — Delete

🧮 *Calculator*
• \`${PREFIX}calc <expression>\`

🎵 *Music & Media*
• \`${PREFIX}play <song name or URL>\` — Play audio
• \`${PREFIX}video <YouTube URL>\` — Download video
• \`${PREFIX}lyrics <song - artist>\` — Get lyrics
• \`${PREFIX}tts <text>\` — Text to speech

👥 *Group Admin*
• \`${PREFIX}tagall [msg]\` — Tag everyone
• \`${PREFIX}kick @user\` — Remove member
• \`${PREFIX}promote @user\` — Make admin
• \`${PREFIX}demote @user\` — Remove admin
• \`${PREFIX}mute on/off\` — Mute/unmute group
• \`${PREFIX}groupinfo\` — Group details

📝 *Bio*
• \`${PREFIX}autobio on 30s\` — Auto bio every 30s
• \`${PREFIX}autobio on 1m/5m/30m/1h/2h\`
• \`${PREFIX}autobio off\` — Stop auto bio
• \`${PREFIX}autobio now\` — Update now

👁️ *Status*
• \`${PREFIX}statusview on/off\` — Auto view statuses

🎮 *Fun & Games*
• \`${PREFIX}joke\` — Random joke
• \`${PREFIX}quote\` — Inspirational quote
• \`${PREFIX}trivia\` — Quiz question
• \`${PREFIX}truth\` — Truth question
• \`${PREFIX}dare\` — Dare challenge
• \`${PREFIX}wyr\` — Would you rather?
• \`${PREFIX}8ball <question>\` — Magic 8 ball
• \`${PREFIX}ship <name1> <name2>\` — Compatibility
• \`${PREFIX}sticker\` — Image to sticker

━━━━━━━━━━━━━━━━━━━━
Prefix: \`${PREFIX}\` | Made with ❤️
`.trim();

  await sock.sendMessage(from, { text });
};
