const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');
const axios = require('axios');
const { menu } = require('./menus'); // coloque no topo do arquivo junto com os outros requires
const { isAdmin } = require('./utils');
const donoConfig = JSON.parse(fs.readFileSync('./dono/settings.json', 'utf-8'));


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
    console.log('🔍 ID do usuário:', message.from);


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
        // Comando: desligar
        if (command === 'desligar') {
            if (!isAdmin(message.from)) {
                return await message.reply('🚫 Você não tem permissão para desligar o bot.');
            }
        
            await message.reply('🛑 Desligando o bot...');
            setTimeout(() => process.exit(0), 1000);
        }
        
        if (command === 'donomenu') {
            if (!isAdmin(message.from)) {
                return await message.reply('🚫 Acesso negado.');
            }
        
            const menu = 
                `🔧 *Menu do Dono/Admin*\n\n` +
                `⚙️ *${config.bot_name}* v${config.version}\n` +
                `📅 ${new Date().toLocaleString()}\n\n` +
                `📌 Comandos disponíveis:\n` +
                `- ${prefix}desligar → Desliga o bot\n` +
                `- (Adicione mais comandos aqui depois)\n`;
        
            await message.reply(menu);
        }
        
 
});


client.initialize();