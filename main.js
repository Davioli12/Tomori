import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import fs from 'fs';
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import config from './config.js';
import menu from './lib/menu.js';
import menuAdm from './lib/menuadm.js';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

const prefixes = ['!', '.', '/'];
const admins = config.admins;

const isAdmin = (userId) => admins.includes(userId);

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('ready', () => {
  console.clear();
  console.log(gradient.instagram(figlet.textSync(config.bot_name)));
  console.log(chalk.green(`[✔] ${config.bot_name} está online!`));
});

client.on('message_create', async message => {
  const userId = message.from;

  if (!message.body || typeof message.body !== 'string') return;

  const msg = message.body.trim();
  const isCmd = prefixes.some(p => msg.startsWith(p));
  if (!isCmd) return;

  const usedPrefix = prefixes.find(p => msg.startsWith(p));
  const args = msg.slice(usedPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const sendWithMenuImage = async (caption) => {
    const media = MessageMedia.fromFilePath('./midia/menu.jpg');
    return await client.sendMessage(userId, media, { caption });
  };

  console.log(`[${message.fromMe ? 'EU' : 'OUTRO'}] ${msg}`);
  console.log('🔍 ID do usuário:', userId);

  if (command === 'ping') {
    return await sendWithMenuImage('🏓 Pong!');
  }

  if (command === 'info') {
    const now = new Date();
    return await sendWithMenuImage(
      `🤖 *${config.bot_name}* v${config.version}\n` +
      `👤 Dono: ${config.owner}\n` +
      `⏰ Horário: ${now.toLocaleString()}`
    );
  }

  if (command === 'menu') {
    const menuText = menu(usedPrefix, config.bot_name, userId);
    return await sendWithMenuImage(menuText);
  }

  if (command === 'sticker' || command === 's') {
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      const mimetype = media.mimetype;

      if (mimetype.startsWith('image') || mimetype.startsWith('video')) {
        return await message.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerName: config.bot_name,
          stickerAuthor: config.owner,
        });
      } else {
        return await sendWithMenuImage('⚠️ Mídia não suportada. Envie uma *imagem* ou *vídeo curto*.');
      }
    } else {
      return await sendWithMenuImage('❗ Envie uma imagem ou vídeo junto com o comando!');
    }
  }

  if (command === 'hentai') {
    try {
      const res = await axios.get('https://nekos.life/api/v2/img/hentai');
      return await sendWithMenuImage(`🔞 Aqui está seu hentai:\n${res.data.url}`);
    } catch (err) {
      console.error(err);
      return await sendWithMenuImage('❌ Erro ao buscar conteúdo NSFW.');
    }
  }

  if (command === 'desligar') {
    if (!isAdmin(userId)) {
      return await sendWithMenuImage('🚫 Você não tem permissão para desligar o bot.');
    }
    await sendWithMenuImage('🛑 Desligando o bot...');
    return setTimeout(() => process.exit(0), 1000);
  }

  if (command === 'donomenu') {
    if (isAdmin(userId)) {
      const menuText = menuAdm(usedPrefix, config.bot_name, userId);
      return await sendWithMenuImage(menuText);
    } else {
      return await sendWithMenuImage('❌ Você não tem permissão para isso.');
    }
  }

  if (command === 'crash') {
    return await sendWithMenuImage('💥 Enviando crash...');
  }

  if (command === 'anime') {
    const nome = args.join(' ');
    if (!nome) return await sendWithMenuImage('❗ Use: !anime <nome do anime>');

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nome)}&limit=1`);
      const anime = res.data.data[0];
      if (!anime) return await sendWithMenuImage('❌ Anime não encontrado.');

      const legenda = `🎌 *${anime.title}* (${anime.type})\n\n📖 ${anime.synopsis?.slice(0, 500)}\n\n🔗 *Link:* ${anime.url}`;
      return await sendWithMenuImage(legenda);
    } catch (err) {
      console.error(err);
      return await sendWithMenuImage('❌ Erro ao buscar informações do anime.');
    }
  }

  if (command === 'animepic') {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');
      return await sendWithMenuImage(`🖼️ Aqui está sua imagem de anime:\n${res.data.url}`);
    } catch (err) {
      console.error(err);
      return await sendWithMenuImage('❌ Erro ao buscar imagem.');
    }
  }

  if (command === 'quoteanime') {
    try {
      const res = await axios.get('https://animechan.xyz/api/random');
      const q = res.data;
      return await sendWithMenuImage(`💬 *\"${q.quote}\"*\n— ${q.character} (${q.anime})`);
    } catch (err) {
      console.error(err);
      return await sendWithMenuImage('❌ Erro ao buscar citação de anime.');
    }
  }
});

client.initialize();
