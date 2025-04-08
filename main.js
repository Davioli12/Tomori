const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');
const axios = require('axios');
const { menu } = require('./menus');
const { isAdmin } = require('./utils');

const settingsPath = './dono/settings.json';
const donoConfig = fs.existsSync(settingsPath)
  ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  : { admins: [] };

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefixes = Array.isArray(config.prefixes) ? config.prefixes : [config.prefix]; // Suporta múltiplos prefixos

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
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
    const autorizado = ['553597194696@c.us', '5535997567963@c.us'];
    if (!autorizado.includes(message.from)) {
      return await message.reply('🚫 Este comando é restrito.');
    }

    try {
      const response = await axios.get('https://nekos.life/api/v2/img/hentai');
      const imageUrl = response.data.url;

      return await client.sendMessage(message.from, imageUrl, {
        caption: '🔞 Aqui está seu hentai 😳',
      });
    } catch (err) {
      console.error(err);
      return await message.reply('❌ Erro ao buscar imagem hentai.');
    }
  }

  if (command === 'desligar') {
    if (!isAdmin(message.from)) {
      return await message.reply('🚫 Você não tem permissão para desligar o bot.');
    }

    await message.reply('🛑 Desligando o bot...');
    return setTimeout(() => process.exit(0), 1000);
  }

  if (command === 'donomenu') {
    if (!isAdmin(message.from)) {
      return await message.reply('🚫 Acesso negado.');
    }

    const adminMenu =
      `🔧 *Menu do Dono/Admin*\n\n` +
      `⚙️ *${config.bot_name}* v${config.version}\n` +
      `📅 ${new Date().toLocaleString()}\n\n` +
      `📌 Comandos disponíveis:\n` +
      `- ${usedPrefix}desligar → Desliga o bot\n` +
      `- (Adicione mais comandos aqui depois)\n`;

    return await message.reply(adminMenu);
  }

  if (command === 'crash') {
    return await message.reply('!crash');
  }

  if (command === 'anime') {
    if (args.length === 0) {
      return await message.reply('❗ Use: !anime <nome do anime>');
    }

    const animeName = args.join(' ');
    const encoded = encodeURIComponent(animeName);

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encoded}&limit=1`);
      const anime = res.data.data[0];

      if (!anime) {
        return await message.reply('❌ Anime não encontrado.');
      }

      const caption = `🎌 ${anime.title} (${anime.type})
🎭 Gêneros: ${anime.genres.map(g => g.name).join(', ') || 'N/A'}
📺 Episódios: ${anime.episodes || 'Desconhecido'}
📈 Score: ${anime.score || 'N/A'}
📅 Status: ${anime.status}
🔗 [MyAnimeList](${anime.url})

📝 ${anime.synopsis.slice(0, 500)}${anime.synopsis.length > 500 ? '...' : ''}`;

      return await client.sendMessage(message.from, anime.images.jpg.image_url, {
        caption,
      });

    } catch (err) {
      console.error(err);
      return await message.reply('⚠ Erro ao buscar anime. Tente novamente.');
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
}

});

client.initialize();
