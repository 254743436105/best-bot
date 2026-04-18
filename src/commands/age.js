module.exports = async (sock, msg, args, from) => {
  if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Usage: `!age <DD/MM/YYYY>`\nExample: `!age 15/08/2000`' });
  const parts = args[0].split('/');
  if (parts.length !== 3) return sock.sendMessage(from, { text: '❌ Use format: DD/MM/YYYY' });
  const dob = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
  if (isNaN(dob)) return sock.sendMessage(from, { text: '❌ Invalid date.' });
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) { months--; days += 30; }
  if (months < 0) { years--; months += 12; }
  const nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
  const daysUntil = Math.ceil((nextBirthday - now) / 86400000);
  await sock.sendMessage(from, { text: `🎂 *Age Calculator*\n━━━━━━━━━━━━━━━\n📅 DOB: ${args[0]}\n🎉 Age: *${years} years, ${months} months, ${days} days*\n🎁 Next birthday in: *${daysUntil} days*` });
};
