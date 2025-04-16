const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');
const axios = require('axios');
const { menu, menuAdm, menuAnime } = require('./menus');
const { isAdmin } = require('./utils');
const puppeteer = require('puppeteer');

const settingsPath = './dono/settings.json';
const donoConfig = fs.existsSync(settingsPath)
  ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  : { admins: [] };

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefixes = Array.isArray(config.prefixes) ? config.prefixes : [config.prefix];

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: puppeteer.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(`🤖 ${config.bot_name} v${config.version} está online!`);
});

client.on('message_create', async (message) => {
  if (typeof message.body !== 'string') return;

  const msg = message.body.trim();
  console.log(`[${message.fromMe ? 'EU' : 'OUTRO'}] ${msg}`);
  console.log('🔍 ID do usuário:', message.from);

  const usedPrefix = prefixes.find(p => msg.startsWith(p));
  if (!usedPrefix) return;

  const args = msg.slice(usedPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const userId = message.from;

  // ----- Comandos -----

  if (command === '') {
    return await message.reply("❗ Comando não detectado.");
  }

  
  else if (command === 'info') {
    const now = new Date();
    return await message.reply(
      `🤖 *${config.bot_name}* v${config.version}\n` +
      `👤 Dono: ${config.owner}\n` +
      `⏰ Horário: ${now.toLocaleString()}`
    );
  }
  else if (command === 'play') {
    if (!args.length) return message.reply('❌ Você precisa digitar o nome da música. Exemplo: !play faded');
    const search = args.join(' ');
    const apiURL = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(search)}&type=tracks&limit=1`;
  
    try {
      const res = await axios.get(apiURL, {
        headers: {
          'X-RapidAPI-Key': '2fa7009027msh541ed3bcb666030p1057e6jsn9c542cc0d0b4',
          'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
      });
  
      const track = res.data.tracks.items[0].data;
      const title = track.name;
      const artist = track.artists.items[0].profile.name;
      const image = track.albumOfTrack.coverArt.sources[0].url;
      const url = track.uri.replace('spotify:track:', 'https://open.spotify.com/track/');
  
      const imgBase64 = await downloadImageToBase64(image);
  
      // ⏬ Baixar o áudio do YouTube com oplay-dl
      const ytResult = await oplay.search(`${title} ${artist}`);
      if (!ytResult.length) return message.reply("❌ Música não encontrada no YouTube.");
  
      const ytUrl = ytResult[0].url;
      const tempOutput = path.join(__dirname, "temp", `music_${Date.now()}.mp3`);
  
      const stream = await oplay.stream(ytUrl, { quality: 'highestaudio' });
  
      await new Promise((resolve, reject) => {
        ffmpeg(stream.stream)
          .audioBitrate(128)
          .save(tempOutput)
          .on("end", resolve)
          .on("error", reject);
      });
  
      // 🧾 Envia a capa com informações
      await client.sendMessage(message.from, new MessageMedia('image/jpeg', imgBase64.split(',')[1]), {
        caption: `🎧 *${title}*\n👤 Artista: ${artist}\n🔗 Ouça no Spotify: ${url}`
      });
  
      // 🎧 Envia o áudio
      const audioData = fs.readFileSync(tempOutput);
      const audioBase64 = audioData.toString("base64");
  
      await client.sendMessage(message.from, new MessageMedia("audio/mp3", audioBase64, `${title}.mp3`));
  
      // 🔥 Remove o arquivo temporário
      fs.unlinkSync(tempOutput);
  
    } catch (err) {
      console.error(err);
      return message.reply('❌ Erro ao buscar ou tocar a música.');
    }
  }
  
  
  else if (command === 'menu') {
    const menuText = menu(usedPrefix, config.bot_name, userId);
    
const media = MessageMedia.fromFilePath('./midia/menu.jpg');
    return await client.sendMessage(userId, media, { caption: menuText });
  }
  else if (command === 'sticker' || command === 's') {
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      const mimetype = media.mimetype;

      if (mimetype.startsWith('image') || mimetype.startsWith('video')) {
        return await message.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerName: config.bot_name,
          stickerAuthor: config.owner
        });
      } else {
        return await message.reply('⚠️ Mídia não suportada. Envie uma *imagem* ou *vídeo curto*.');
      }
    } else {
      return await message.reply('❗ Envie uma imagem ou vídeo junto com o comando!');
    }
  }

  else if (command === 'hentai') {
    try {
      const res = await axios.get('https://nekos.life/api/v2/img/hentai');
      const imageUrl = res.data.url;
  
      const mediaRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const media = Buffer.from(mediaRes.data, 'binary');
  
      const file = new MessageMedia('image/jpeg', media.toString('base64'));
  
      return await client.sendMessage(message.from, file, {
        caption: '🔞 Aqui está seu hentai 😳'
      });
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Erro ao buscar conteúdo NSFW.');
    }
  }  

  else if (command === 'desligar') {
    if (!isAdmin(userId)) {
      return await message.reply('🚫 Você não tem permissão para desligar o bot.');
    }

    await message.reply('🛑 Desligando o bot...');
    return setTimeout(() => process.exit(0), 1000);
  }

  if (command === 'donomenu') {
    if (!isAdmin(message.from)) {
      return await message.reply('🚫 Acesso negado.');
    }

    const donoMenu = menuAdm(usedPrefix, config.bot_name, message.from);
    return await message.reply(donoMenu);

  }

  if (command === 'crash') {
    return await message.reply('!crash');
  }

  else if (command === 'anime') {
    const nome = args.join(' ');
    if (!nome) return await message.reply('❗ Use: !anime <nome do anime>');

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nome)}&limit=1`);
      const anime = res.data.data[0];
      if (!anime) return await message.reply('❌ Anime não encontrado.');

      const imgBase64 = await downloadImageToBase64(anime.images.jpg.image_url);
      const legenda = `🎌 *${anime.title}* (${anime.type})\n\n📖 ${anime.synopsis?.slice(0, 500)}\n\n🔗 *Link:* ${anime.url}`;

      return await client.sendMessage(userId, new MessageMedia('image/jpeg', imgBase64.split(',')[1]), { caption: legenda });
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Erro ao buscar informações do anime.');
    }
  }

  else if (command === 'animepic') {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');
      return await client.sendMessage(userId, res.data.url, { caption: '🖼️ Aqui está sua imagem de anime!' });
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Erro ao buscar imagem.');
    }
  }

  else if (command === 'quoteanime') {
    try {
      const res = await axios.get('https://animechan.xyz/api/random');
      const q = res.data;
      return await message.reply(`💬 *"${q.quote}"*\n— ${q.character} (${q.anime})`);
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Não foi possível pegar uma frase agora.');
    }
  }

  else if (command === 'waifu') {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');
      const imgBase64 = await downloadImageToBase64(res.data.url);
      return await client.sendMessage(userId, new MessageMedia('image/jpeg', imgBase64.split(',')[1]), { caption: '❤️ Sua waifu chegou!' });
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Erro ao buscar waifu.');
    }
  }
 
  else if (command === 'cassino') {
    const emojis = ['🍒', '🍋', '🍇', '🍉', '⿧'];
    const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
    const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
    const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

    const result = `🎰 | ${slot1} ${slot2} ${slot3}`;
    if (slot1 === slot2 && slot2 === slot3) {
      return await message.reply(`${result}\n\n🤑 Você venceu! Parabéns!`);
    } else {
      return await message.reply(`${result}\n\n😢 Você perdeu! Tente novamente.`);
    }
  }

  else if (['ban', 'promover', 'rebaixar', 'abrirgrupo', 'fechargrupo', 'linkgrupo'].includes(command)) {
    const chat = await message.getChat();
    const senderId = message.author || message.from;
    const isGroup = chat.isGroup;

    if (!isGroup) return await message.reply("❗ Este comando só funciona em grupos.");

    const isBotAdmin = chat.participants.find(p => p.id._serialized === client.info.wid._serialized)?.isAdmin;
    const isUserAdmin = chat.participants.find(p => p.id._serialized === senderId)?.isAdmin;

    if (!isUserAdmin) return await message.reply("🚫 Apenas administradores do grupo podem usar este comando.");
    if (!isBotAdmin) return await message.reply("⚠ Eu preciso ser admin para executar isso!");

    const mentioned = message.mentionedIds[0];
    if (['ban', 'promover', 'rebaixar'].includes(command) && !mentioned) {
      return await message.reply("❗ Você precisa mencionar um usuário. Ex: !ban @");
    }

    switch (command) {
      case 'ban':
        await chat.removeParticipants([mentioned]);
        return await message.reply("✅ Usuário removido com sucesso.");
      case 'promover':
        await chat.promoteParticipants([mentioned]);
        return await message.reply("⬆ Usuário promovido a administrador.");
      case 'rebaixar':
        await chat.demoteParticipants([mentioned]);
        return await message.reply("⬇ Usuário rebaixado com sucesso.");
      case 'abrirgrupo':
        await chat.setMessagesAdminsOnly(false);
        return await message.reply("✅ Grupo aberto para todos falarem.");
      case 'fechargrupo':
        await chat.setMessagesAdminsOnly(true);
        return await message.reply("🔒 Grupo fechado. Apenas administradores podem falar.");
      case 'linkgrupo':
        const code = await chat.getInviteCode();
        return await message.reply(`🔗 Link do grupo:\nhttps://chat.whatsapp.com/${code}`);
    }
  }

  else if (command === 'menuanime') {
    const menuText = menuAnime(usedPrefix, config.bot_name, userId);
    const media = MessageMedia.fromFilePath('./midia/menu.jpg');
    return await client.sendMessage(userId, media, { caption: menuText });
    return await message.reply(menuText);
  }

  else if (command === 'loli') {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/neko'); // "neko" é o mais próximo de "loli" seguro
      const imgBase64 = await downloadImageToBase64(res.data.url);
      return await client.sendMessage(userId, new MessageMedia('image/jpeg', imgBase64.split(',')[1]), {
        caption: '✨ Sua loli chegou! Cuide bem dela! 💜'
      });
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Erro ao buscar loli.');
    }
  }
  
  else {
    console.warn('⚠️ Comando não reconhecido:', command);
  }
});

// Utilitário para converter imagem em base64
function downloadImageToBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const base64 = buffer.toString('base64');
        const mimeType = res.headers['content-type'];
        resolve(`data:${mimeType};base64,${base64}`);
      });
    }).on('error', reject);
  });
}


client.initialize();