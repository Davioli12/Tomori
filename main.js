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
        await message.reply('!ping');
    }

    if (command === 'info') {
        const now = new Date();
        await message.reply(
            `🤖 *${config.bot_name}* v${config.version}\n👤 Dono: ${config.owner}\n⏰ Horário: ${now.toLocaleString()}`
        );
    }
});

client.initialize();
