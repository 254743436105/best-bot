const help        = require('./help');
const time        = require('./time');
const weather     = require('./weather');
const forecast    = require('./forecast');
const remind      = require('./remind');
const reminders   = require('./reminders');
const calc        = require('./calc');
const ping        = require('./ping');
const alive       = require('./alive');
const joke        = require('./joke');
const quote       = require('./quote');
const sticker     = require('./sticker');
const play        = require('./play');
const video       = require('./video');
const statusview  = require('./statusview');
const savestatus  = require('./savestatus');
const tagall      = require('./tagall');
const autobio     = require('./autobio');
const tts         = require('./tts');
const define      = require('./define');
const translate   = require('./translate');
const news        = require('./news');
const convert     = require('./convert');
const trivia      = require('./trivia');
const dare        = require('./dare');
const truth       = require('./truth');
const ship        = require('./ship');
const kick        = require('./kick');
const promote     = require('./promote');
const demote      = require('./demote');
const groupinfo   = require('./groupinfo');
const mute        = require('./mute');
const wyr         = require('./wyr');
const ball8       = require('./8ball');
const lyrics      = require('./lyrics');
const antidelete  = require('./antidelete');

module.exports = {
  help,
  time, date: time,
  weather, forecast,
  remind, reminders,
  calc, calculate: calc,
  ping, alive,
  joke, quote,
  sticker,
  play, music: play,
  video, vid: video,
  statusview, sv: statusview,
  savestatus, ss: savestatus,
  tagall, tag: tagall,
  autobio, bio: autobio,
  tts,
  define, dictionary: define,
  translate, tr: translate,
  news,
  convert, currency: convert,
  trivia,
  dare, truth,
  ship,
  kick, remove: kick,
  promote, demote,
  groupinfo, ginfo: groupinfo,
  mute,
  wyr,
  '8ball': ball8,
  lyrics,
  antidelete, ad: antidelete,
};
