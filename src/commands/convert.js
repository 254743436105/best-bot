const axios = require('axios');

module.exports = async (sock, msg, args, from) => {
  if (args.length < 3) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!convert <amount> <from> <to>`\nExample: `!convert 100 USD KES`\n`!convert 5000 KES USD`',
    });
  }

  const [amount, from_currency, to_currency] = args;
  const num = parseFloat(amount);

  if (isNaN(num)) {
    return sock.sendMessage(from, { text: '❌ Invalid amount. Use a number.' });
  }

  const fromC = from_currency.toUpperCase();
  const toC = to_currency.toUpperCase();

  try {
    const res = await axios.get(`https://open.er-api.com/v6/latest/${fromC}`, { timeout: 8000 });

    if (res.data.result !== 'success') {
      return sock.sendMessage(from, { text: `❌ Unknown currency: *${fromC}*` });
    }

    const rate = res.data.rates[toC];
    if (!rate) {
      return sock.sendMessage(from, { text: `❌ Unknown currency: *${toC}*` });
    }

    const result = (num * rate).toFixed(2);

    await sock.sendMessage(from, {
      text: `💱 *Currency Converter*\n━━━━━━━━━━━━━━━\n💰 ${num} ${fromC} = *${result} ${toC}*\n📈 Rate: 1 ${fromC} = ${rate.toFixed(4)} ${toC}\n━━━━━━━━━━━━━━━\n_Rates from Open Exchange_`,
    });
  } catch (err) {
    console.error('Convert error:', err.message);
    await sock.sendMessage(from, { text: '❌ Could not fetch exchange rates. Try again later.' });
  }
};
