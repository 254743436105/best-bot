const PREFIX = process.env.PREFIX || '!';

function getBody(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ''
  );
}

function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

const commands = {
  help:        require('../commands/help'),
  ping:        require('../commands/ping'),
  alive:       require('../commands/alive'),
  time:        require('../commands/time'),
  today:       require('../commands/today'),
  ai:          require('../commands/ai'),
  define:      require('../commands/define'),
  wikipedia:   require('../commands/wikipedia'),
  country:     require('../commands/country'),
  ip:          require('../commands/ip'),
  github:      require('../commands/github'),
  speed:       require('../commands/speed'),
  bible:       require('../commands/bible'),
  quran:       require('../commands/quran'),
  weather:     require('../commands/weather'),
  forecast:    require('../commands/forecast'),
  calc:        require('../commands/calc'),
  math:        require('../commands/math'),
  convert:     require('../commands/convert'),
  temperature: require('../commands/temperature'),
  weight:      require('../commands/weight'),
  length:      require('../commands/length'),
  area:        require('../commands/area'),
  percentage:  require('../commands/percentage'),
  bmi:         require('../commands/bmi'),
  age:         require('../commands/age'),
  howold:      require('../commands/howold'),
  timer:       require('../commands/timer'),
  remind:      require('../commands/remind'),
  reminders:   require('../commands/reminders'),
  storage:     require('../commands/storage'),
  uuid:        require('../commands/uuid'),
  password:    require('../commands/password'),
  play:        require('../commands/play'),
  video:       require('../commands/video'),
  lyrics:      require('../commands/lyrics'),
  sticker:     require('../commands/sticker'),
  tts:         require('../commands/tts'),
  translate:   require('../commands/translate'),
  app:         require('../commands/app'),
  qr:          require('../commands/qr'),
  binary:      require('../commands/binary'),
  hex:         require('../commands/hex'),
  hash:        require('../commands/hash'),
  encode:      require('../commands/encode'),
  decode:      require('../commands/decode'),
  wordcount:   require('../commands/wordcount'),
  reverse:     require('../commands/reverse'),
  spell:       require('../commands/spell'),
  sports:      require('../commands/sports'),
  news:        require('../commands/news'),
  joke:        require('../commands/joke'),
  joke2:       require('../commands/joke2'),
  joke3:       require('../commands/joke3'),
  pun:         require('../commands/pun'),
  riddle:      require('../commands/riddle'),
  trivia:      require('../commands/trivia'),
  hangman:     require('../commands/hangman'),
  tictactoe:   require('../commands/tictactoe'),
  wordle:      require('../commands/wordle'),
  '8ball':     require('../commands/8ball'),
  truth:       require('../commands/truth'),
  dare:        require('../commands/dare'),
  wyr:         require('../commands/wyr'),
  poll:        require('../commands/poll'),
  choose:      require('../commands/choose'),
  roll:        require('../commands/roll'),
  flip:        require('../commands/flip'),
  random:      require('../commands/random'),
  rate:        require('../commands/rate'),
  ship:        require('../commands/ship'),
  love:        require('../commands/love'),
  roast:       require('../commands/roast'),
  insult:      require('../commands/insult'),
  compliment:  require('../commands/compliment'),
  pickup:      require('../commands/pickup'),
  hack:        require('../commands/hack'),
  horoscope:   require('../commands/horoscope'),
  zodiac:      require('../commands/zodiac'),
  fortune:     require('../commands/fortune'),
  motivate:    require('../commands/motivate'),
  quote:       require('../commands/quote'),
  advice:      require('../commands/advice'),
  fact:        require('../commands/fact'),
  catfact:     require('../commands/catfact'),
  dogfact:     require('../commands/dogfact'),
  numberfact:  require('../commands/numberfact'),
  pokemon:     require('../commands/pokemon'),
  rhyme:       require('../commands/rhyme'),
  synonym:     require('../commands/synonym'),
  antonym:     require('../commands/antonym'),
  welcome:     require('../commands/welcome'),
  goodbye:     require('../commands/goodbye'),
  tagall:      require('../commands/tagall'),
  groupinfo:   require('../commands/groupinfo'),
  kick:        require('../commands/kick'),
  promote:     require('../commands/promote'),
  demote:      require('../commands/demote'),
  mute:        require('../commands/mute'),
  presence:    require('../commands/presence'),
  statusview:  require('../commands/statusview'),
  savestatus:  require('../commands/savestatus'),
  autobio:     require('../commands/autobio'),
  afk:         require('../commands/afk'),
  antidelete:  require('../commands/antidelete'),
  creep:       require('../commands/creep'),
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
      await commands[cmd].execute(sock, msg, args, jid, sender);
    } else {
      await sock.sendMessage(jid, { text: `❓ Unknown command. Type *${PREFIX}help* to see all commands.` });
    }
  } catch (err) {
    console.error('handleMessage error:', err);
  }
}

module.exports = { handleMessage };
