const help = require('./help');
const time = require('./time');
const weather = require('./weather');
const remind = require('./remind');
const reminders = require('./reminders');
const calc = require('./calc');
const ping = require('./ping');
const joke = require('./joke');
const quote = require('./quote');
const sticker = require('./sticker');
const play = require('./play');
const statusview = require('./statusview');

module.exports = {
  help,
  time,
  date: time,
  weather,
  remind,
  reminders,
  calc,
  calculate: calc,
  ping,
  joke,
  quote,
  sticker,
  play,
  music: play,      // alias
  statusview,
  sv: statusview,   // alias
};
