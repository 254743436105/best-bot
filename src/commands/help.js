const PREFIX = process.env.PREFIX || '!';

async function execute(sock, msg, args, jid) {
  const page = args[0];

  if (page === '2') {
    await sock.sendMessage(jid, { text: `📱 *Commands Page 2/3*\n\n😂 *Fun & Games*\n${PREFIX}joke ${PREFIX}joke2 ${PREFIX}joke3 ${PREFIX}pun\n${PREFIX}riddle ${PREFIX}trivia ${PREFIX}hangman ${PREFIX}wordle\n${PREFIX}tictactoe ${PREFIX}8ball ${PREFIX}truth ${PREFIX}dare\n${PREFIX}wyr ${PREFIX}poll ${PREFIX}choose ${PREFIX}roll\n${PREFIX}flip ${PREFIX}random ${PREFIX}rate ${PREFIX}ship\n${PREFIX}love ${PREFIX}roast ${PREFIX}insult ${PREFIX}compliment\n${PREFIX}pickup ${PREFIX}hack\n\n🌟 *Facts & Horoscope*\n${PREFIX}horoscope ${PREFIX}zodiac ${PREFIX}fortune\n${PREFIX}motivate ${PREFIX}quote ${PREFIX}advice ${PREFIX}fact\n${PREFIX}catfact ${PREFIX}dogfact ${PREFIX}numberfact\n${PREFIX}pokemon ${PREFIX}rhyme ${PREFIX}synonym ${PREFIX}antonym\n\n_Type *${PREFIX}help 3* for Groups & Status commands_ 👇` });
    return;
  }

  if (page === '3') {
    await sock.sendMessage(jid, { text: `👥 *Commands Page 3/3*\n\n👥 *Groups*\n${PREFIX}welcome ${PREFIX}goodbye ${PREFIX}tagall\n${PREFIX}groupinfo ${PREFIX}kick ${PREFIX}promote\n${PREFIX}demote ${PREFIX}mute ${PREFIX}poll\n\n👤 *Presence & Status*\n${PREFIX}presence typing/recording/online\n${PREFIX}statusview on/off\n${PREFIX}savestatus ${PREFIX}autobio\n${PREFIX}afk ${PREFIX}antidelete ${PREFIX}creep\n\n🎵 *Media*\n${PREFIX}play ${PREFIX}video ${PREFIX}lyrics\n${PREFIX}sticker ${PREFIX}tts ${PREFIX}translate\n\n📱 *Tech*\n${PREFIX}binary ${PREFIX}hex ${PREFIX}hash\n${PREFIX}encode ${PREFIX}decode ${PREFIX}wordcount\n${PREFIX}reverse ${PREFIX}spell ${PREFIX}app\n${PREFIX}uuid ${PREFIX}password ${PREFIX}storage` });
    return;
  }

  // Page 1 (default)
  await sock.sendMessage(jid, { text: `🤖 *Bot Commands Page 1/3*\n_Type *${PREFIX}help 2* or *${PREFIX}help 3* for more_\n\n🎯 *General*\n${PREFIX}ping ${PREFIX}alive ${PREFIX}time ${PREFIX}today\n\n🤖 *AI & Info*\n${PREFIX}ai <question> — Ask AI\n${PREFIX}define <word> — Dictionary\n${PREFIX}wikipedia <q> — Wikipedia\n${PREFIX}country <name> — Country info\n${PREFIX}ip <address> — IP lookup\n${PREFIX}github <user> — GitHub profile\n${PREFIX}speed — Speed test\n\n📖 *Religion*\n${PREFIX}bible <ref> — e.g. John 3:16\n${PREFIX}bible random\n${PREFIX}quran <ref> — e.g. 2:255\n${PREFIX}quran random\n\n🌤️ *Utilities*\n${PREFIX}weather ${PREFIX}forecast ${PREFIX}calc ${PREFIX}math\n${PREFIX}convert ${PREFIX}temperature ${PREFIX}weight\n${PREFIX}length ${PREFIX}area ${PREFIX}percentage\n${PREFIX}bmi ${PREFIX}age ${PREFIX}howold ${PREFIX}timer\n${PREFIX}remind ${PREFIX}reminders\n\n⚽ *Sports & News*\n${PREFIX}sports ${PREFIX}sports <topic> ${PREFIX}news` });
}

module.exports = { execute };
