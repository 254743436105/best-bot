const axios = require('axios');

module.exports = async (sock, msg, args, from) => {
  try {
    const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist', {
      timeout: 8000,
    });

    const joke = res.data;
    let text;

    if (joke.type === 'single') {
      text = `😂 *Joke*\n\n${joke.joke}`;
    } else {
      text = `😂 *Joke*\n\n${joke.setup}\n\n||${joke.delivery}||`;
    }

    await sock.sendMessage(from, { text });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Could not fetch a joke right now. Try again!' });
  }
};
