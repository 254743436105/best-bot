module.exports = async (sock, msg, args, from) => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  await sock.sendMessage(from, { text: `🆔 *UUID Generator*\n\n\`${uuid}\`` });
};
