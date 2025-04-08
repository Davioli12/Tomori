const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Carrega configurações
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefix = config.prefix;

const client = new Client({
    authStrategy: new LocalAuth(), // Salva login
    puppeteer: { headless: true }
});

// Gera QR code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log(`🤖 ${config.bot_name} v${config.version} está online!`);
});

// Responde todas mensagens (inclusive suas)
client.on('message_create', async (message) => {
    const msg = message.body.trim();

    // Exibe quem enviou
    console.log(`[${message.fromMe ? 'EU' : 'OUTRO'}] ${msg}`);

    // Verifica se começa com o prefixo
    if (!msg.startsWith(prefix)) return;

    const args = msg.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

   if (command === 'ping') {
    await message.reply('🏓 Pong!');
}

if (command === 'info') {
    const now = new Date();
    await message.reply(
        `🤖 *${config.bot_name}* v${config.version}\n👤 Dono: ${config.owner}\n⏰ Horário: ${now.toLocaleString()}`
    );
}

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

if (command === 'hentai') {
    // Protege para uso pessoal (opcional)
    const autorizado = ['SEU_NUMERO@c.us']; // Exemplo: ['559999999999@c.us']
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


client.initialize();
