async function execute(sock, msg, args, jid) {
  if (!args.length) {
    return sock.sendMessage(jid, { text: '⚠️ Usage: !calc <expression>\nExample: !calc 15% of 3000' });
  }

  let expr = args.join(' ').trim();

  // Handle "X% of Y"
  expr = expr.replace(/(\d+\.?\d*)%\s+of\s+(\d+\.?\d*)/i, (_, pct, base) =>
    ((parseFloat(pct) / 100) * parseFloat(base)).toString()
  );

  // Allow only safe characters
  if (!/^[\d\s\+\-\*\/\.\(\)%]+$/.test(expr)) {
    return sock.sendMessage(jid, { text: '❌ Invalid expression.' });
  }

  try {
    // eslint-disable-next-line no-eval
    const result = Function('"use strict"; return (' + expr + ')')();
    await sock.sendMessage(jid, { text: `🧮 *Result:*\n${args.join(' ')} = *${result}*` });
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Could not calculate: ${e.message}` });
  }
}

module.exports = { execute };
