const PREFIX = process.env.PREFIX || '!';

function getBody(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.ephemeralMessage?.message?.conversation ||
    msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    ''
  );
}

function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

const commands = {
  '8ball':     require('../commands/8ball'),
  advice:      require('../commands/advice'),
  afk:         require('../commands/afk'),
  age:         require('../commands/age'),
  ai:          require('../commands/ai'),
  alive:       require('../commands/alive'),
  antidelete:  require('../commands/antidelete'),
  antonym:     require('../commands/antonym'),
  app:         require('../commands/app'),
  area:        require('../commands/area'),
  autobio:     require('../commands/autobio'),
  bible:       require('../commands/bible'),
  binary:      require('../commands/binary'),
  bmi:         require('../commands/bmi'),
  calc:        require('../commands/calc'),
  catfact:     require('../commands/catfact'),
  choose:      require('../commands/choose'),
  compliment:  require('../commands/compliment'),
  convert:     require('../commands/convert'),
  country:     require('../commands/country'),
  creep:       require('../commands/creep'),
  dare:        require('../commands/dare'),
  decode:      require('../commands/decode'),
  define:      require('../commands/define'),
  demote:      require('../commands/demote'),
  dogfact:     require('../commands/dogfact'),
  encode:      require('../commands/encode'),
  fact:        require('../commands/fact'),
  flip:        require('../commands/flip'),
  forecast:    require('../commands/forecast'),
  fortune:     require('../commands/fortune'),
  github:      require('../commands/github'),
  goodbye:     require('../commands/goodbye'),
  groupinfo:   require('../commands/groupinfo'),
  hack:        require('../commands/hack'),
  hangman:     require('../commands/hangman'),
  hash:        require('../commands/hash'),
  help:        require('../commands/help'),
  hex:         require('../commands/hex'),
  horoscope:   require('../commands/horoscope'),
  howold:      require('../commands/howold'),
  insult:      require('../commands/insult'),
  ip:          require('../commands/ip'),
  joke:        require('../commands/joke'),
  joke2:       require('../commands/joke2'),
  joke3:       require('../commands/joke3'),
  kick:        require('../commands/kick'),
  length:      require('../commands/length'),
  love:        require('../commands/love'),
  lyrics:      require('../commands/lyrics'),
  math:        require('../commands/math'),
  motivate:    require('../commands/motivate'),
  mute:        require('../commands/mute'),
  news:        require('../commands/news'),
  numberfact:  require('../commands/numberfact'),
  password:    require('../commands/password'),
  percentage:  require('../commands/percentage'),
  pickup:      require('../commands/pickup'),
  ping:        require('../commands/ping'),
  play:        require('../commands/play'),
  pokemon:     require('../commands/pokemon'),
  poll:        require('../commands/poll'),
  presence:    require('../commands/presence'),
  promote:     require('../commands/promote'),
  pun:         require('../commands/pun'),
  qr:          require('../commands/qr'),
  quran:       require('../commands/quran'),
  quote:       require('../commands/quote'),
  random:      require('../commands/random'),
  rate:        require('../commands/rate'),
  remind:      require('../commands/remind'),
  reminders:   require('../commands/reminders'),
  reverse:     require('../commands/reverse'),
  rhyme:       require('../commands/rhyme'),
  riddle:      require('../commands/riddle'),
  roast:       require('../commands/roast'),
  roll:        require('../commands/roll'),
  savestatus:  require('../commands/savestatus'),
  ship:        require('../commands/ship'),
  speed:       require('../commands/speed'),
  spell:       require('../commands/spell'),
  sports:      require('../commands/sports'),
  statusview:  require('../commands/statusview'),
  sticker:     require('../commands/sticker'),
  storage:     require('../commands/storage'),
  synonym:     require('../commands/synonym'),
  tagall:      require('../commands/tagall'),
  temperature: require('../commands/temperature'),
  tictactoe:   require('../commands/tictactoe'),
  time:        require('../commands/time'),
  timer:       require('../commands/timer'),
  today:       require('../commands/today'),
  translate:   require('../commands/translate'),
  trivia:      require('../commands/trivia'),
  truth:       require('../commands/truth'),
  tts:         require('../commands/tts'),
  uuid:        require('../commands/uuid'),
  video:       require('../commands/video'),
  weather:     require('../commands/weather'),
  weight:      require('../commands/weight'),
  welcome:     require('../commands/welcome'),
  wikipedia:   require('../commands/wikipedia'),
  wordcount:   require('../commands/wordcount'),
  wordle:      require('../commands/wordle'),
  wyr:         require('../commands/wyr'),
  zodiac:      require('../commands/zodiac'),
};

async function handleMessage(sock, msg) {
  try {
    const body = getBody(msg).trim();
    if (!body.startsWith(PREFIX)) return;

    const [rawCmd, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = rawCmd.toLowerCase();
    const jid = msg.key.remoteJid;
    const sender = getSender(msg);

    if (commands[cmd]) {
      const mod = commands[cmd];
      // Support both export formats:
      // 1. module.exports = { execute } 
      // 2. module.exports = async (sock, msg, args, jid) => {}
      if (typeof mod === 'function') {
        await mod(sock, msg, args, jid, sender);
      } else if (typeof mod.execute === 'function') {
        await mod.execute(sock, msg, args, jid, sender);
      }
    } else {
      await sock.sendMessage(jid, { text: `❓ Unknown command. Type *${PREFIX}help* to see all commands.` });
    }
  } catch (err) {
    console.error('handleMessage error:', err);
  }
}

module.exports = { handleMessage };
