const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Configurações do bot
const prefix = '/'; // Prefixo personalizado

const menuInfo = {
    nome: "Bot do João",
    versao: "v1.0.0",
    dono: "João Silva",
};

// Cria o cliente com sessão salva
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'session-bot', // Nome da pasta onde a sessão será salva
    })
});

// Quando estiver pronto
client.on('ready', () => {
    console.log('✅ Bot está pronto e logado!');
});

// Gera QR code (só na primeira vez)
client.on('qr', qr => {
    console.log('📲 Escaneie o QR code abaixo:');
    qrcode.generate(qr, { small: true });
});

// Evento ao receber mensagens
client.on('message_create', message => {
    const msg = message.body.trim();

    if (msg === `${prefix}ping`) {
        client.sendMessage(message.from, 'pong');
    }

    if (msg === `${prefix}menu`) {
        const now = new Date();
        const horario = now.toLocaleTimeString('pt-BR');
        const data = now.toLocaleDateString('pt-BR');

        const resposta = `📋 *Menu do Bot*

📛 *Nome:* ${menuInfo.nome}
🧾 *Versão:* ${menuInfo.versao}
👤 *Dono:* ${menuInfo.dono}
⏰ *Horário:* ${data} às ${horario}

📌 *Comandos disponíveis:*
- ${prefix}ping → Teste de conexão
- ${prefix}menu → Exibe este menu
        `;

        client.sendMessage(message.from, resposta);
    }
});

// Inicializa o bot
client.initialize();
