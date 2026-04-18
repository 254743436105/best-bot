module.exports = async (sock, msg, args, from) => {
  if (args.length < 2) return sock.sendMessage(from, { text: '⚠️ Usage: `!bmi <weight(kg)> <height(cm)>`\nExample: `!bmi 70 175`' });
  const weight = parseFloat(args[0]), height = parseFloat(args[1]) / 100;
  if (isNaN(weight) || isNaN(height) || height <= 0) return sock.sendMessage(from, { text: '❌ Invalid values.' });
  const bmi = (weight / (height * height)).toFixed(1);
  let category, emoji;
  if (bmi < 18.5) { category = 'Underweight'; emoji = '⚠️'; }
  else if (bmi < 25) { category = 'Normal weight'; emoji = '✅'; }
  else if (bmi < 30) { category = 'Overweight'; emoji = '⚠️'; }
  else { category = 'Obese'; emoji = '❗'; }
  await sock.sendMessage(from, { text: `⚖️ *BMI Calculator*\n━━━━━━━━━━━━━━━\n📊 BMI: *${bmi}*\n${emoji} Category: *${category}*\n━━━━━━━━━━━━━━━\n_Weight: ${weight}kg | Height: ${args[1]}cm_` });
};
