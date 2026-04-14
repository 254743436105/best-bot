const fs = require('fs');
const path = require('path');

const REMINDERS_FILE = path.join(__dirname, '../../data/reminders.json');

let reminders = [];

function loadReminders() {
  try {
    if (!fs.existsSync(path.dirname(REMINDERS_FILE))) {
      fs.mkdirSync(path.dirname(REMINDERS_FILE), { recursive: true });
    }
    if (fs.existsSync(REMINDERS_FILE)) {
      reminders = JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8'));
      console.log(`⏰ Loaded ${reminders.length} reminders.`);
    }
  } catch (e) {
    reminders = [];
  }
}

function saveReminders() {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
}

function addReminder(jid, text, timeMs) {
  const reminder = { jid, text, time: timeMs, id: Date.now() };
  reminders.push(reminder);
  saveReminders();
  return reminder;
}

async function checkReminders(sock) {
  const now = Date.now();
  const due = reminders.filter((r) => r.time <= now);

  for (const reminder of due) {
    try {
      await sock.sendMessage(reminder.jid, {
        text: `⏰ *Reminder!*\n\n${reminder.text}`,
      });
    } catch (e) {
      console.error('Failed to send reminder:', e.message);
    }
  }

  if (due.length > 0) {
    reminders = reminders.filter((r) => r.time > now);
    saveReminders();
  }
}

function listReminders(jid) {
  return reminders.filter((r) => r.jid === jid);
}

function deleteReminder(jid, id) {
  const before = reminders.length;
  reminders = reminders.filter((r) => !(r.jid === jid && r.id === Number(id)));
  saveReminders();
  return reminders.length < before;
}

module.exports = { loadReminders, saveReminders, addReminder, checkReminders, listReminders, deleteReminder };
