const PREFIX = process.env.PREFIX || '!';

async function execute(sock, msg, args, jid) {
  const text = `
🤖 *WhatsApp Bot — All Commands*

━━━━━━━━━━━━━━━━━━
🎯 *General*
━━━━━━━━━━━━━━━━━━
${PREFIX}help              — Show this menu
${PREFIX}ping              — Check bot status
${PREFIX}alive             — Is the bot alive?
${PREFIX}time              — Current date & time
${PREFIX}today             — Today's info

━━━━━━━━━━━━━━━━━━
🤖 *AI & Info*
━━━━━━━━━━━━━━━━━━
${PREFIX}ai <question>     — Ask AI anything
${PREFIX}define <word>     — Dictionary definition
${PREFIX}wikipedia <q>     — Wikipedia search
${PREFIX}country <name>    — Country info
${PREFIX}ip <address>      — IP address lookup
${PREFIX}github <user>     — GitHub profile info
${PREFIX}speed             — Internet speed test

━━━━━━━━━━━━━━━━━━
📖 *Religion*
━━━━━━━━━━━━━━━━━━
${PREFIX}bible <ref>       — Bible verse (e.g. John 3:16)
${PREFIX}bible random      — Random Bible verse
${PREFIX}quran <ref>       — Quran verse (e.g. 2:255)
${PREFIX}quran random      — Random Quran verse

━━━━━━━━━━━━━━━━━━
🌤️ *Utilities*
━━━━━━━━━━━━━━━━━━
${PREFIX}weather <city>    — Live weather
${PREFIX}forecast <city>   — Weather forecast
${PREFIX}calc <expr>       — Calculator
${PREFIX}math <expr>       — Math solver
${PREFIX}convert <val>     — Unit converter
${PREFIX}temperature <v>   — Temp converter
${PREFIX}weight <val>      — Weight converter
${PREFIX}length <val>      — Length converter
${PREFIX}area <val>        — Area converter
${PREFIX}percentage <v>    — Percentage calc
${PREFIX}bmi <h> <w>       — BMI calculator
${PREFIX}age <date>        — Age calculator
${PREFIX}howold <date>     — How old are you?
${PREFIX}timer <time>      — Set a timer
${PREFIX}remind <t> <msg>  — Set a reminder
${PREFIX}reminders         — List reminders
${PREFIX}reminders del <id>— Delete reminder
${PREFIX}storage           — Storage info
${PREFIX}uuid              — Generate UUID
${PREFIX}password          — Generate password

━━━━━━━━━━━━━━━━━━
🎵 *Media*
━━━━━━━━━━━━━━━━━━
${PREFIX}play <song>       — Search & send audio
${PREFIX}video <name>      — Search & send video
${PREFIX}lyrics <song>     — Get song lyrics
${PREFIX}sticker           — Image → sticker (reply to image)
${PREFIX}tts <text>        — Text to speech
${PREFIX}translate <text>  — Translate text

━━━━━━━━━━━━━━━━━━
📱 *Apps & Tech*
━━━━━━━━━━━━━━━━━━
${PREFIX}app <name>        — Search Google Play
${PREFIX}qr                — Session QR info
${PREFIX}binary <text>     — Text to binary
${PREFIX}hex <text>        — Text to hex
${PREFIX}hash <text>       — Hash generator
${PREFIX}encode <text>     — Base64 encode
${PREFIX}decode <text>     — Base64 decode
${PREFIX}wordcount <text>  — Count words
${PREFIX}reverse <text>    — Reverse text
${PREFIX}spell <text>      — Spell checker

━━━━━━━━━━━━━━━━━━
⚽ *Sports & News*
━━━━━━━━━━━━━━━━━━
${PREFIX}sports             — Latest sports news
${PREFIX}sports <topic>     — Sports by topic
${PREFIX}news               — Latest news

━━━━━━━━━━━━━━━━━━
😂 *Fun & Games*
━━━━━━━━━━━━━━━━━━
${PREFIX}joke               — Random joke
${PREFIX}joke2              — Another joke style
${PREFIX}joke3              — Yet another joke
${PREFIX}pun                — Random pun
${PREFIX}riddle             — Random riddle
${PREFIX}trivia             — Trivia question
${PREFIX}hangman            — Play hangman
${PREFIX}tictactoe          — Play tic tac toe
${PREFIX}wordle             — Play wordle
${PREFIX}8ball <question>   — Magic 8 ball
${PREFIX}truth              — Truth question
${PREFIX}dare               — Dare challenge
${PREFIX}wyr                — Would you rather
${PREFIX}poll <question>    — Create a poll
${PREFIX}choose <a|b>       — Choose between options
${PREFIX}roll               — Roll a dice
${PREFIX}flip               — Flip a coin
${PREFIX}random             — Random number
${PREFIX}rate <thing>       — Rate something
${PREFIX}ship <a> <b>       — Ship two people
${PREFIX}love <name>        — Love meter
${PREFIX}roast <name>       — Roast someone 😂
${PREFIX}insult <name>      — Insult generator
${PREFIX}compliment         — Give a compliment
${PREFIX}pickup             — Pickup line
${PREFIX}hack <target>      — Fake hacker prank 😂

━━━━━━━━━━━━━━━━━━
🌟 *Horoscope & Facts*
━━━━━━━━━━━━━━━━━━
${PREFIX}horoscope <sign>   — Daily horoscope
${PREFIX}zodiac <sign>      — Zodiac info
${PREFIX}fortune            — Fortune cookie
${PREFIX}motivate           — Motivational message
${PREFIX}quote              — Inspirational quote
${PREFIX}advice             — Random advice
${PREFIX}fact               — Random fact
${PREFIX}catfact            — Cat fact
${PREFIX}dogfact            — Dog fact
${PREFIX}numberfact <n>     — Fact about a number
${PREFIX}pokemon <name>     — Pokémon info
${PREFIX}rhyme <word>       — Find rhymes
${PREFIX}synonym <word>     — Find synonyms
${PREFIX}antonym <word>     — Find antonyms

━━━━━━━━━━━━━━━━━━
👥 *Groups*
━━━━━━━━━━━━━━━━━━
${PREFIX}welcome on/off     — Toggle welcome msg
${PREFIX}goodbye on/off     — Toggle goodbye msg
${PREFIX}tagall <msg>       — Tag all members
${PREFIX}groupinfo          — Group information
${PREFIX}kick @user         — Kick a member
${PREFIX}promote @user      — Promote to admin
${PREFIX}demote @user       — Demote from admin
${PREFIX}mute               — Mute the group

━━━━━━━━━━━━━━━━━━
👤 *Presence & Status*
━━━━━━━━━━━━━━━━━━
${PREFIX}presence <type>    — typing/recording/online/offline
${PREFIX}statusview on/off  — Auto view statuses
${PREFIX}savestatus         — Save status to inbox
${PREFIX}autobio <text>     — Set your WhatsApp bio
${PREFIX}afk <reason>       — Set AFK status
${PREFIX}antidelete on/off  — Recover deleted msgs
${PREFIX}creep              — Spy mode 👀

_Type any command to get started!_ 🚀
`.trim();

  await sock.sendMessage(jid, { text });
}

module.exports = { execute };
