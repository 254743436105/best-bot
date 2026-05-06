// ── Core ──────────────────────────────────────────────────────────
const help        = require('./help');
const ping        = require('./ping');
const alive       = require('./alive');
const time        = require('./time');

// ── Weather ───────────────────────────────────────────────────────
const weather     = require('./weather');
const forecast    = require('./forecast');

// ── Info & Search ─────────────────────────────────────────────────
const news        = require('./news');
const define      = require('./define');
const translate   = require('./translate');
const wikipedia   = require('./wikipedia');
const country     = require('./country');
const ip          = require('./ip');
const github      = require('./github');
const today       = require('./today');
const numberfact  = require('./numberfact');

// ── Finance ───────────────────────────────────────────────────────
const convert     = require('./convert');

// ── Converters ────────────────────────────────────────────────────
const temperature = require('./temperature');
const length      = require('./length');
const weight      = require('./weight');
const speed       = require('./speed');
const storage     = require('./storage');
const binary      = require('./binary');
const hex         = require('./hex');
const percentage  = require('./percentage');
const area        = require('./area');

// ── Math & Utils ──────────────────────────────────────────────────
const calc        = require('./calc');
const math        = require('./math');
const bmi         = require('./bmi');
const age         = require('./age');
const timer       = require('./timer');
const poll        = require('./poll');
const hash        = require('./hash');
const encode      = require('./encode');
const decode      = require('./decode');
const uuid        = require('./uuid');
const password    = require('./password');
const wordcount   = require('./wordcount');
const reverse     = require('./reverse');
const spell       = require('./spell');

// ── Reminders ─────────────────────────────────────────────────────
const remind      = require('./remind');
const reminders   = require('./reminders');

// ── Media ─────────────────────────────────────────────────────────
const play        = require('./play');
const video       = require('./video');
const lyrics      = require('./lyrics');
const tts         = require('./tts');
const sticker     = require('./sticker');

// ── Group Admin ───────────────────────────────────────────────────
const tagall      = require('./tagall');
const kick        = require('./kick');
const promote     = require('./promote');
const demote      = require('./demote');
const mute        = require('./mute');
const groupinfo   = require('./groupinfo');
const welcome     = require('./welcome');
const goodbye     = require('./goodbye');

// ── Bio & Status ──────────────────────────────────────────────────
const autobio     = require('./autobio');
const statusview  = require('./statusview');
const savestatus  = require('./savestatus');
const antidelete  = require('./antidelete');

// ── Word Tools ────────────────────────────────────────────────────
const rhyme       = require('./rhyme');
const synonym     = require('./synonym');
const antonym     = require('./antonym');

// ── Fun & Personality ─────────────────────────────────────────────
const joke        = require('./joke');
const pun         = require('./pun');
const pickup      = require('./pickup');
const compliment  = require('./compliment');
const roast       = require('./roast');
const insult      = require('./insult');
const fact        = require('./fact');
const advice      = require('./advice');
const catfact     = require('./catfact');
const dogfact     = require('./dogfact');
const motivate    = require('./motivate');
const fortune     = require('./fortune');
const quote       = require('./quote');

// ── Generators ────────────────────────────────────────────────────
const roll        = require('./roll');
const flip        = require('./flip');
const random      = require('./random');
const choose      = require('./choose');
const rate        = require('./rate');
const love        = require('./love');
const ship        = require('./ship');
const howold      = require('./howold');
const creep       = require('./creep');

// ── Astrology ────────────────────────────────────────────────────
const horoscope   = require('./horoscope');
const zodiac      = require('./zodiac');

// ── Games ─────────────────────────────────────────────────────────
const trivia      = require('./trivia');
const dare        = require('./dare');
const truth       = require('./truth');
const wyr         = require('./wyr');
const ball8       = require('./8ball');
const riddle      = require('./riddle');
const math2       = require('./math');
const tictactoe   = require('./tictactoe');
const hangman     = require('./hangman');
const wordle      = require('./wordle');
const pokemon     = require('./pokemon');

// ── Misc ──────────────────────────────────────────────────────────
const afk         = require('./afk');
const joke3       = require('./joke3');

module.exports = {
  // Core
  help, ping, alive, time, date: time,

  // Weather
  weather, forecast,

  // Info
  news, define, dictionary: define, translate, tr: translate,
  wiki: wikipedia, wikipedia, country, ip, github, today, numberfact, nf: numberfact,

  // Finance
  convert, currency: convert,

  // Converters
  temperature, temp: temperature, length, weight, speed, storage,
  binary, hex, percentage, pct: percentage, area,

  // Math & Utils
  calc, calculate: calc, math: math2, bmi, age, timer,
  poll, hash, encode, decode, uuid, password, pass: password,
  wordcount, wc: wordcount, reverse, spell,

  // Reminders
  remind, reminders,

  // Media
  play, music: play, video, vid: video, lyrics, tts, sticker,

  // Group
  tagall, tag: tagall, kick, remove: kick, promote, demote,
  mute, groupinfo, ginfo: groupinfo, welcome, goodbye,

  // Bio & Status
  autobio, bio: autobio, statusview, sv: statusview,
  savestatus, ss: savestatus, antidelete, ad: antidelete,

  // Word tools
  rhyme, synonym, syn: synonym, antonym, ant: antonym,

  // Fun
  joke, pun, pickup, compliment, roast, insult, fact,
  advice, catfact, dogfact, motivate, fortune, quote,

  // Generators
  roll, flip, random, choose, rate, love, ship,
  howold, creep,

  // Astrology
  horoscope, zodiac,

  // Games
  trivia, dare, truth, wyr, '8ball': ball8,
  riddle, ttt: tictactoe, tictactoe,
  hangman, wordle, pokemon, poke: pokemon,

  // Misc
  afk, yomama: joke3,
};
