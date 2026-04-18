const PREFIX = process.env.PREFIX || '!';
module.exports = async (sock, msg, args, from) => {
  const text = `
╔══════════════════════╗
║  🖥️ *H A C K E R  B O T* 🖥️  ║
╚══════════════════════╝
👾 _System Online... Access Granted_ 👾
━━━━━━━━━━━━━━━━━━━━

📋 *[ GENERAL ]*
• \`${PREFIX}alive\` • \`${PREFIX}ping\` • \`${PREFIX}time\`

🌐 *[ WEATHER ]*
• \`${PREFIX}weather <city>\` • \`${PREFIX}forecast <city>\`

🔍 *[ INFO & SEARCH ]*
• \`${PREFIX}wiki <topic>\` — Wikipedia
• \`${PREFIX}news <topic>\` — Latest news
• \`${PREFIX}define <word>\` — Dictionary
• \`${PREFIX}translate <lang> <text>\`
• \`${PREFIX}country <name>\` — Country info
• \`${PREFIX}ip <address>\` — IP lookup
• \`${PREFIX}github <user>\` — GitHub profile
• \`${PREFIX}today\` — This day in history
• \`${PREFIX}numberfact <n>\` — Number fact

💱 *[ CONVERTERS ]*
• \`${PREFIX}convert <amt> <from> <to>\` — Currency
• \`${PREFIX}temp <val> <unit>\` — Temperature
• \`${PREFIX}length <val> <from> <to>\`
• \`${PREFIX}weight <val> <from> <to>\`
• \`${PREFIX}speed <val> <from> <to>\`
• \`${PREFIX}storage <val> <from> <to>\`
• \`${PREFIX}binary <n>\` — Decimal↔Binary
• \`${PREFIX}hex <n>\` — Decimal↔Hex
• \`${PREFIX}percentage <val> <total>\`
• \`${PREFIX}area <shape> <values>\`

🧮 *[ MATH & TOOLS ]*
• \`${PREFIX}calc <expr>\` — Calculator
• \`${PREFIX}math\` — Quick math challenge
• \`${PREFIX}bmi <weight> <height>\`
• \`${PREFIX}age <DD/MM/YYYY>\`
• \`${PREFIX}timer <30s/5m/1h>\`
• \`${PREFIX}poll <q> | <opt1> | <opt2>\`
• \`${PREFIX}hash <text>\` — MD5/SHA256
• \`${PREFIX}encode <text>\` — Base64
• \`${PREFIX}decode <text>\` — Base64
• \`${PREFIX}uuid\` — Generate UUID
• \`${PREFIX}password <length>\`
• \`${PREFIX}wordcount <text>\`
• \`${PREFIX}reverse <text>\`
• \`${PREFIX}spell <word>\`

⏰ *[ REMINDERS ]*
• \`${PREFIX}remind 30m Call John\`
• \`${PREFIX}reminders\` • \`${PREFIX}reminders del <id>\`

🎵 *[ MEDIA ]*
• \`${PREFIX}play <song>\` — Play audio
• \`${PREFIX}video <URL>\` — Download video
• \`${PREFIX}lyrics <song - artist>\`
• \`${PREFIX}tts <text>\` — Text to speech
• \`${PREFIX}sticker\` — Image to sticker

👥 *[ GROUP ADMIN ]*
• \`${PREFIX}tagall [msg]\` — Tag everyone
• \`${PREFIX}kick @user\` • \`${PREFIX}promote @user\`
• \`${PREFIX}demote @user\` • \`${PREFIX}mute on/off\`
• \`${PREFIX}groupinfo\`
• \`${PREFIX}welcome on/off\` — Welcome new members
• \`${PREFIX}goodbye on/off\` — Goodbye messages

🛡️ *[ PROTECTION ]*
• \`${PREFIX}antidelete on/off\` — Reveal deleted msgs
• \`${PREFIX}savestatus on\` — Save statuses
• \`${PREFIX}savestatus list\` — View saved
• \`${PREFIX}savestatus get <n>\` — Download
• \`${PREFIX}statusview on/off\`

📝 *[ AUTO BIO ]*
• \`${PREFIX}autobio on 30s/1m/5m/30m/1h/2h\`
• \`${PREFIX}autobio off\` • \`${PREFIX}autobio now\`

📖 *[ WORD TOOLS ]*
• \`${PREFIX}rhyme <word>\` — Find rhymes
• \`${PREFIX}synonym <word>\` — Synonyms
• \`${PREFIX}antonym <word>\` — Antonyms

⭐ *[ ASTROLOGY ]*
• \`${PREFIX}zodiac <DD/MM>\` — Your sign
• \`${PREFIX}horoscope <sign>\` — Daily reading

😄 *[ FUN ]*
• \`${PREFIX}joke\` • \`${PREFIX}pun\` • \`${PREFIX}yomama\`
• \`${PREFIX}pickup\` — Pickup line
• \`${PREFIX}compliment\` • \`${PREFIX}roast\` • \`${PREFIX}insult\`
• \`${PREFIX}fact\` • \`${PREFIX}advice\`
• \`${PREFIX}catfact\` • \`${PREFIX}dogfact\`
• \`${PREFIX}motivate\` • \`${PREFIX}fortune\` • \`${PREFIX}quote\`

🎲 *[ GENERATORS ]*
• \`${PREFIX}roll <sides>\` — Roll dice
• \`${PREFIX}flip\` — Coin flip
• \`${PREFIX}random <min> <max>\`
• \`${PREFIX}choose a | b | c\`
• \`${PREFIX}rate <name>\` — Rate anything
• \`${PREFIX}love <n1> <n2>\`
• \`${PREFIX}ship <n1> <n2>\`
• \`${PREFIX}howold <name>\`
• \`${PREFIX}creep <name>\`

🎮 *[ GAMES ]*
• \`${PREFIX}trivia\` — Quiz
• \`${PREFIX}riddle\` — Riddle
• \`${PREFIX}truth\` • \`${PREFIX}dare\`
• \`${PREFIX}wyr\` — Would you rather?
• \`${PREFIX}8ball <question>\`
• \`${PREFIX}ttt start\` — Tic Tac Toe
• \`${PREFIX}hangman start\` — Hangman
• \`${PREFIX}wordle start\` — Wordle
• \`${PREFIX}pokemon [name]\`

💤 *[ MISC ]*
• \`${PREFIX}afk [reason]\` — Set AFK status

━━━━━━━━━━━━━━━━━━━━
💻 _Prefix:_ \`${PREFIX}\` _| All Systems Operational_ ✅
_Total Commands: 80+_ 🚀
`.trim();
  await sock.sendMessage(from, { text });
};
