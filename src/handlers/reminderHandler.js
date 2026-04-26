const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/reminders.json');

let reminders = [];

function loadReminders() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      reminders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log(`⏰ Loaded ${reminders.length} reminder(s).`);
    }
  } catch (e) {
    console.error('Failed to load reminders:', e);
    reminders = [];
  }
}

function saveReminders() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(reminders, null, 2));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
}

function addReminder({ jid, sender, text, fireAt }) {
  const id = Date.now().toString(36);
  reminders.push({ id, jid, sender, text, fireAt });
  saveReminders();
  return id;
}

function listReminders(jid) {
  return reminders.filter(r => r.jid === jid);
}

function deleteReminder(id) {
  const before = reminders.length;
  reminders = reminders.filter(r => r.id !== id);
  saveReminders();
  return reminders.length < before;
}

async function checkReminders(sock) {
  const now = Date.now();
  const due = reminders.filter(r => r.fireAt <= now);
  for (const r of due) {
    try {
      await sock.sendMessage(r.jid, {
        text: `⏰ *Reminder:* ${r.text}`,
        mentions: [r.sender],
      });
    } catch (e) {
      console.error('Failed to send reminder:', e);
    }
    deleteReminder(r.id);
  }
}

module.exports = { loadReminders, saveReminders, addReminder, listReminders, deleteReminder, checkReminders };
