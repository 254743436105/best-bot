module.exports = async (sock, msg, args, jid) => {
  const [shape, ...rest] = args;
  const shapes = { circle: '!area circle <radius>', rectangle: '!area rectangle <width> <height>', triangle: '!area triangle <base> <height>', square: '!area square <side>' };
  if (!shape || !shapes[shape]) return sock.sendMessage(jid, { text: `📐 *Area Calculator*\n\nUsage:\n${Object.values(shapes).map(s=>'• `'+s+'`').join('\n')}` });
  let area;
  if (shape === 'circle') area = (Math.PI * Math.pow(parseFloat(rest[0]), 2)).toFixed(2);
  else if (shape === 'rectangle') area = (parseFloat(rest[0]) * parseFloat(rest[1])).toFixed(2);
  else if (shape === 'triangle') area = (0.5 * parseFloat(rest[0]) * parseFloat(rest[1])).toFixed(2);
  else if (shape === 'square') area = Math.pow(parseFloat(rest[0]), 2).toFixed(2);
  if (isNaN(area)) return sock.sendMessage(jid, { text: '❌ Invalid values.' });
  await sock.sendMessage(jid, { text: `📐 *Area of ${shape}*\n\nResult: *${area} square units*` });
};
