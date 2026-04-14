const PREFIX = process.env.PREFIX || '!';

module.exports = async (sock, msg, args, from) => {
  const text = `
╔═══════════════════╗
║  🖥️ *H A C K E R  B O T* 🖥️  ║
╚═══════════════════╝
👾 _System Online... Access Granted_ 👾
━━━━━━━━━━━━━━━━━━━━

📋 *[ GENERAL ]*
• \`${PREFIX}alive\` — Bot status & uptime
• \`${PREFIX}ping\` — Response check
• \`${PREFIX}time\` — Current date & time

🌐 *[ INFO & SEARCH ]*
• \`${PREFIX}weather <city>\` — Current weather
• \`${PREFIX}forecast <city>\` — 5-day forecast
• \`${PREFIX}news <topic>\` — Latest headlines
• \`${PREFIX}define <word>\` — Dictionary
• \`${PREFIX}translate <lang> <text>\` — Translate
• \`${PREFIX}convert <amt> <from> <to>\` — Currency

⏰ *[ REMINDERS ]*
• \`${PREFIX}remind 30m Call John\`
• \`${PREFIX}reminders\` — List all
• \`${PREFIX}reminders del <id>\` — Delete

🧮 *[ CALCULATOR ]*
• \`${PREFIX}calc 15% of 3000\`

🎵 *[ MEDIA ]*
• \`${PREFIX}play <song>\` — Play audio
• \`${PREFIX}video <URL>\` — Download video
• \`${PREFIX}lyrics <song - artist>\` — Lyrics
• \`${PREFIX}tts <text>\` — Text to speech
• \`${PREFIX}sticker\` — Image to sticker

👥 *[ GROUP ADMIN ]*
• \`${PREFIX}tagall [msg]\` — Tag everyone
• \`${PREFIX}kick @user\` — Remove member
• \`${PREFIX}promote @user\` — Make admin
• \`${PREFIX}demote @user\` — Remove admin
• \`${PREFIX}mute on/off\` — Mute group
• \`${PREFIX}groupinfo\` — Group details

🛡️ *[ PROTECTION ]*
• \`${PREFIX}antidelete on/off\` — Reveal deleted msgs
• \`${PREFIX}savestatus on\` — Save contacts statuses
• \`${PREFIX}savestatus list\` — View saved statuses
• \`${PREFIX}savestatus get <n>\` — Download status
• \`${PREFIX}statusview on/off\` — Auto view statuses

📝 *[ AUTO BIO ]*
• \`${PREFIX}autobio on 30s\` — Every 30 seconds
• \`${PREFIX}autobio on 1m/5m/30m/1h/2h\`
• \`${PREFIX}autobio off\` — Disable
• \`${PREFIX}autobio now\` — Update now

🎮 *[ FUN & GAMES ]*
• \`${PREFIX}joke\` — Random joke
• \`${PREFIX}quote\` — Inspiration
• \`${PREFIX}trivia\` — Quiz
• \`${PREFIX}truth\` — Truth question
• \`${PREFIX}dare\` — Dare challenge
• \`${PREFIX}wyr\` — Would you rather?
• \`${PREFIX}8ball <question>\` — Magic 8 ball
• \`${PREFIX}ship <name1> <name2>\` — Compatibility

━━━━━━━━━━━━━━━━━━━━
💻 _Prefix:_ \`${PREFIX}\` _| All Systems Operational_ ✅
`.trim();

  await sock.sendMessage(from, { text });
};
