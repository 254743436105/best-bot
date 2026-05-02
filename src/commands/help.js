const PREFIX = process.env.PREFIX || '!';

async function execute(sock, msg, args, jid) {
  const category = args[0]?.toLowerCase();

  if (category === '2') {
    await sock.sendMessage(jid, { text: `
🎵 *Media & Tech*
${PREFIX}play <song> — Audio
${PREFIX}video <name> — Video
${PREFIX}lyrics <song> — Lyrics
${PREFIX}sticker — Image to sticker
${PREFIX}tts <text> — Text to speech
${PREFIX}translate <text> — Translate
${PREFIX}app <name> — Google Play search
${PREFIX}binary <text> — Text to binary
${PREFIX}hex <text> — Text to hex
${PREFIX}hash <text> — Hash generator
${PREFIX}encode <text> — Base64 encode
${PREFIX}decode <text> — Base64 decode
${PREFIX}wordcount <text> — Word count
${PREFIX}reverse <text> — Reverse text
${PREFIX}spell <text> — Spell check

😂 *Fun & Games*
${PREFIX}joke ${PREFIX}joke2 ${PREFIX}joke3 ${PREFIX}pun
${PREFIX}riddle ${PREFIX}trivia ${PREFIX}hangman
${PREFIX}tictactoe ${PREFIX}wordle ${PREFIX}8ball <q>
${PREFIX}truth ${PREFIX}dare ${PREFIX}wyr ${PREFIX}poll <q>
${PREFIX}choose ${PREFIX}roll ${PREFIX}flip ${PREFIX}random
${PREFIX}rate ${PREFIX}ship ${PREFIX}love ${PREFIX}roast
${PREFIX}insult ${PREFIX}compliment ${PREFIX}pickup ${PREFIX}hack

🌟 *Facts & Horoscope*
${PREFIX}horoscope ${PREFIX}zodiac ${PREFIX}fortune
${PREFIX}motivate ${PREFIX}quote ${PREFIX}advice ${PREFIX}fact
${PREFIX}catfact ${PREFIX}dogfact ${PREFIX}numberfact
${PREFIX}pokemon ${PREFIX}rhyme ${PREFIX}synonym ${PREFIX}antonym

👥 *Groups*
${PREFIX}welcome ${PREFIX}goodbye ${PREFIX}tagall
${PREFIX}groupinfo ${PREFIX}kick ${PREFIX}promote
${PREFIX}demote ${PREFIX}mute

👤 *Status & Presence*
${PREFIX}presence ${PREFIX}statusview ${PREFIX}savestatus
${PREFIX}autobio ${PREFIX}afk ${PREFIX}antidelete ${PREFIX}creep
    `.trim() });
    return;
  }

  // Default: page 1
  await sock.sendMessage(jid, { text: `
🤖 *WhatsApp Bot Commands — Page 1/2*
_Type *${PREFIX}help 2* for more commands_

🎯 *General*
${PREFIX}ping ${PREFIX}alive ${PREFIX}time ${PREFIX}today

🤖 *AI & Info*
${PREFIX}ai <question> — Ask AI anything
${PREFIX}define <word> — Dictionary
${PREFIX}wikipedia <q> — Wikipedia
${PREFIX}country <name> — Country info
${PREFIX}ip <address> — IP lookup
${PREFIX}github <user> — GitHub profile
${PREFIX}speed — Speed test

📖 *Religion*
${PREFIX}bible <ref> — e.g. John 3:16
${PREFIX}bible random — Random verse
${PREFIX}quran <ref> — e.g. 2:255
${PREFIX}quran random — Random ayah

🌤️ *Utilities*
${PREFIX}weather ${PREFIX}forecast ${PREFIX}calc ${PREFIX}math
${PREFIX}convert ${PREFIX}temperature ${PREFIX}weight ${PREFIX}length
${PREFIX}area ${PREFIX}percentage ${PREFIX}bmi ${PREFIX}age
${PREFIX}howold ${PREFIX}timer ${PREFIX}remind ${PREFIX}reminders
${PREFIX}storage ${PREFIX}uuid ${PREFIX}password

⚽ *Sports & News*
${PREFIX}sports — Latest sports news
${PREFIX}sports <topic> — By topic
${PREFIX}news — Latest news

_Type *${PREFIX}help 2* for Media, Games, Groups & more_ 👇
  `.trim() });
}

module.exports = { execute };
