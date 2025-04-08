const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');
const axios = require('axios');
const { menu } = require('./menus'); // coloque no topo do arquivo junto com os outros requires

// Carrega configurações
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefix = config.prefix;

const client = new Client({
    authStrategy: new LocalAuth(), // Salva o login (sessão)
    puppeteer: { headless: true }  // Não abre o navegador visualmente
});

// Gera o QR Code para login
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log(`🤖 ${config.bot_name} v${config.version} está online!`);
});

// Ao receber qualquer mensagem
client.on('message_create', async (message) => {
    const msg = message.body.trim();

    // Exibe quem enviou
    console.log(`[${message.fromMe ? 'EU' : 'OUTRO'}] ${msg}`);

    // Ignora se não começar com o prefixo
    if (!msg.startsWith(prefix)) return;

    // Separa comando e argumentos
    const args = msg.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Comando: ping
    if (command === 'ping') {
        await message.reply('🏓 Pong!');
    }

    // Comando: info
    if (command === 'info') {
        const now = new Date();
        await message.reply(
            `🤖 *${config.bot_name}* v${config.version}\n` +
            `👤 Dono: ${config.owner}\n` +
            `⏰ Horário: ${now.toLocaleString()}`
        );
    }

    // Menu do Bot
    if (command === 'menu') {
        const menuText = menu(prefix, config.bot_name, message.from);
        await message.reply(menuText);
    }

    // Comando: sticker
        // Comando: sticker
        if (command === 'sticker' || command === 's') {
            if (message.hasMedia) {
                const media = await message.downloadMedia();
                const mimetype = media.mimetype;
    
                if (mimetype.startsWith('image') || mimetype.startsWith('video')) {
                    await message.reply(media, undefined, {
                        sendMediaAsSticker: true,
                        stickerName: config.bot_name,
                        stickerAuthor: config.owner
                    });
                } else {
                    await message.reply('⚠️ Mídia não suportada. Envie uma *imagem* ou *vídeo curto*.');
                }
            } else {
                await message.reply('❗ Envie uma imagem ou vídeo junto com o comando!');
            }
        }
    
        // Comando: hentai (restrito)
        if (command === 'hentai') {
            const autorizado = ['553597194696@c.us', '5535997567963@c.us']; // Substitua pelos seus números autorizados
    
            if (!autorizado.includes(message.from)) {
                return await message.reply('🚫 Este comando é restrito.');
            }
    
            try {
                const response = await axios.get('https://nekos.life/api/v2/img/hentai');
                const imageUrl = response.data.url;
    
                await client.sendMessage(message.from, imageUrl, {
                    caption: '🔞 Aqui está seu hentai 😳',
                });
            } catch (err) {
                console.error(err);
                await message.reply('❌ Erro ao buscar imagem hentai.');
            }
        }    
});


client.initialize();

