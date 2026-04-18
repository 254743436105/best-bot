module.exports = async (sock, msg, args, from) => {
  if (!args.length) {
    return sock.sendMessage(from, {
      text: '⚠️ Usage: `!calc <expression>`\nExamples:\n• `!calc 2 + 2`\n• `!calc 15% of 3000`\n• `!calc (100 * 5) / 2`',
    });
  }

  let expr = args.join(' ');

  try {
    // Handle "X% of Y" pattern
    expr = expr.replace(/(\d+\.?\d*)%\s*of\s*(\d+\.?\d*)/gi, (_, pct, total) => {
      return `(${pct} / 100) * ${total}`;
    });

    // Safely evaluate math expressions (no eval on arbitrary code)
    const sanitized = expr.replace(/[^0-9+\-*/().\s%]/g, '');
    if (!sanitized.trim()) throw new Error('Invalid expression');

    // Use Function constructor limited to math
    const result = Function(`"use strict"; return (${sanitized})`)();

    if (!isFinite(result)) throw new Error('Result is not finite');

    const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));

    await sock.sendMessage(from, {
      text: `🧮 *Calculator*\n\n📥 Input: \`${args.join(' ')}\`\n📤 Result: *${formatted}*`,
    });
  } catch (err) {
    await sock.sendMessage(from, {
      text: `❌ Invalid expression: \`${args.join(' ')}\`\n\nTry: \`!calc 100 * 5 / 2\``,
    });
  }
};
