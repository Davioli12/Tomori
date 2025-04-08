const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');
const axios = require('axios');
const { menu, menuAdm, menuAnime } = require('./menus');
const { isAdmin } = require('./utils');
const puppeteer = require('puppeteer');
const https = require('https');
const translate = require('@vitalets/google-translate-api');


const settingsPath = './dono/settings.json';
const donoConfig = fs.existsSync(settingsPath)
  ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  : { admins: [] };

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefixes = Array.isArray(config.prefixes) ? config.prefixes : [config.prefix]; // Suporta múltiplos prefixos

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      executablePath: puppeteer.executablePath(), // usa Chromium incluído
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
  const msg = message.body.trim();
  console.log(`[${message.fromMe ? 'EU' : 'OUTRO'}] ${msg}`);
  console.log('🔍 ID do usuário:', message.from);
  

  // Detecta qual prefixo foi usado
  const usedPrefix = prefixes.find(p => msg.startsWith(p));
  if (!usedPrefix) return;

  const args = msg.slice(usedPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // -------------------------
  //        COMANDOS
  // -------------------------

  if (command === 'ping') {
    return await message.reply('🏓 Pong!');
  }

  if (command === 'info') {
    const now = new Date();
    return await message.reply(
      `🤖 *${config.bot_name}* v${config.version}\n` +
      `👤 Dono: ${config.owner}\n` +
      `⏰ Horário: ${now.toLocaleString()}`
    );
  }

  if (command === 'menu') {
    const menuText = menu(usedPrefix, config.bot_name, message.from);
    return await message.reply(menuText);
  }

  if (command === 'sticker' || command === 's') {
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

  if (command === 'hentai') {
    try {
        const res = await axios.get('https://nekos.life/api/v2/img/hentai');
        await client.sendMessage(message.from, res.data.url, {
            caption: '🔞 Aqui está seu hentai 😳',
        });
    } catch (err) {
        console.error(err);
        await message.reply('❌ Erro ao buscar conteúdo NSFW.');
    }
  }
  if (command === 'desligar') {
    if (!isAdmin(message.from)) {
      return await message.reply('🚫 Você não tem permissão para desligar o bot.');
    }

    await message.reply('🛑 Desligando o bot...');
    return setTimeout(() => process.exit(0), 1000);
  }
  const userId = message.from;
  if (command === 'donomenu') {
    if (isAdmin(userId)) {
        const menuText = menuAdm(usedPrefix, config.bot_name, message.from);
        await message.reply(menuText)
    } else {
        await message.reply("❌ Você não tem permissão para isso.");
    }
}

  if (command === 'crash') {
    return await message.reply('!crash');
  }

  if (command === 'anime') {
    const nome = args.join(' ');
    if (!nome) return await message.reply('❗ Use: !anime <nome do anime>');

    try {
        const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nome)}&limit=1`);
        const anime = res.data.data[0];
        if (!anime) return await message.reply('❌ Anime não encontrado.');

        const imgBase64 = await downloadImageToBase64(anime.images.jpg.image_url);
        const media = await MessageMedia.fromUrl(anime.images.jpg.image_url); // Alternativa se preferir
        const legenda = `🎌 *${anime.title}* (${anime.type})\n\n📖 ${anime.synopsis?.slice(0, 500)}\n\n🔗 *Link:* ${anime.url}`;

        await client.sendMessage(message.from, new MessageMedia('image/jpeg', imgBase64.split(',')[1]), { caption: legenda });
    } catch (err) {
        console.error(err);
        await message.reply('❌ Erro ao buscar informações do anime.');
    }
}
  if (command === 'animepic') {
    try {
        const res = await axios.get('https://api.waifu.pics/sfw/waifu');
        await client.sendMessage(message.from, res.data.url, { caption: '🖼️ Aqui está sua imagem de anime!' });
    } catch (err) {
        console.error(err);
        await message.reply('❌ Erro ao buscar imagem.');
    }
}
if (command === 'quoteanime') {
  try {
      const res = await axios.get('https://animechan.xyz/api/random');
      const q = res.data;
      await message.reply(`💬 *"${q.quote}"*\n— ${q.character} (${q.anime})`);
  } catch (err) {
      console.error(err);
      await message.reply('❌ Não foi possível pegar uma frase agora.');
  }
}
if (command === 'waifu') {
  try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');
      const imgBase64 = await downloadImageToBase64(res.data.url);
      await client.sendMessage(message.from, new MessageMedia('image/jpeg', imgBase64.split(',')[1]), { caption: '❤️ Sua waifu chegou!' });
  } catch (err) {
      console.error(err);
      await message.reply('❌ Erro ao buscar waifu.');
  }
}

if (command === 'cassino') {
  const emojis = ['🍒', '🍋', '🍇', '🍉', '⿧'];
  const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
  const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
  const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

  const result = `🎰 | ${slot1} ${slot2} ${slot3}`;

  if (slot1 === slot2 && slot2 === slot3) {
      await message.reply(`${result}\n\n🤑 Você venceu! Parabéns!`);
  } else {
      await message.reply(`${result}\n\n😢 Você perdeu! Tente novamente.`);
  }

  return; // <- adicione isso para garantir que finalize aqui
}

// comandos de grupo ficam FORA do 'cassino'
if (['ban', 'promover', 'rebaixar', 'abrirgrupo', 'fechargrupo', 'linkgrupo'].includes(command)) {
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
          await message.reply("✅ Usuário removido com sucesso.");
          break;

      case 'promover':
          await chat.promoteParticipants([mentioned]);
          await message.reply("⬆ Usuário promovido a administrador.");
          break;

      case 'rebaixar':
          await chat.demoteParticipants([mentioned]);
          await message.reply("⬇ Usuário rebaixado com sucesso.");
          break;

      case 'abrirgrupo':
          await chat.setMessagesAdminsOnly(false);
          await message.reply("✅ Grupo aberto para todos falarem.");
          break;

      case 'fechargrupo':
          await chat.setMessagesAdminsOnly(true);
          await message.reply("🔒 Grupo fechado. Apenas administradores podem falar.");
          break;

      case 'linkgrupo':
          const code = await chat.getInviteCode();
          await message.reply(`🔗 Link do grupo:\nhttps://chat.whatsapp.com/${code}`);
          break;
  }
}

if (command === 'menuanime') {
  const menuText = menuAnime(usedPrefix, config.bot_name, message.from);
  return await message.reply(menuText);
}
if (command === '') {
  return await message.reply("Nao detectador o comando")
}

})
// Função para baixar imagem e converter para base64
function downloadImageToBase64(url) {
  return new Promise((resolve, reject) => {
      https.get(url, (res) => {
          let data = [];

          res.on('data', (chunk) => data.push(chunk));
          res.on('end', () => {
              const buffer = Buffer.concat(data);
              const base64 = buffer.toString('base64');
              const mimeType = res.headers['content-type'];
              resolve(`data:${mimeType};base64,${base64}`);
          });
      }).on('error', reject);
  });
}

// Função principal: envia imagem com legenda traduzida
async function sendTranslatedImageMessage(client, chatId, imageUrl, captionText) {
  try {
      // Traduz o texto para português
      const translated = await translate(captionText, { to: 'pt' });
      const translatedText = translated.text;

      // Baixa a imagem e converte
      const base64 = await downloadImageToBase64(imageUrl);
      const media = new MessageMedia(base64.split(';')[0].split(':')[1], base64.split(',')[1]);

      // Envia a imagem com a legenda traduzida
      await client.sendMessage(chatId, media, { caption: translatedText });
      console.log("Imagem enviada com legenda traduzida!");
  } catch (error) {
      console.error("Erro ao enviar imagem com tradução:", error);
  }
}


client.initialize();