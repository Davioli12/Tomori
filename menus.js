const menu = (prefix, NomeDoBot, sender) => {
  return `
╭━━━⊰  *${NomeDoBot}*  ⊱━━━╮
┃ 👤 Usuário: @${sender.split('@')[0]}
┃ 🤖 Prefixo: *${prefix}*
┃ 🔧 Bot: *${NomeDoBot}*
╰━━━━━━━━━━━━━━━━━━━╯

╭───⌬ *Comandos Gerais* ⌬───╮
┃ ${prefix}menu - Exibe este menu
┃ ${prefix}play <nome> - Toca música
┃ ${prefix}info - Info do bot
┃ ${prefix}ping - Ver latência
╰──────────────────────────╯

╭───⌬ *Outros* ⌬───╮
┃ ${prefix}sticker - Criar figurinha
┃ ${prefix}anime <nome> - Info de anime
┃ ${prefix}git <user> - Ver GitHub
╰───────────────────╯

🔰 *By: ${NomeDoBot}* 🔰
  `;
};

const menuAdm = (prefix) => {
  return `🛡 Menu de Administração

📌 Comandos do Dono/Admins:
${prefix}ban @
${prefix}desligar
${prefix}msgall <texto>
${prefix}promover @
${prefix}rebaixar @
${prefix}abrirgrupo
${prefix}fechargrupo
${prefix}linkgrupo
${prefix}limpar
${prefix}apagar
${prefix}statusbot
`;
};
const menuAnime = (prefix) => {
  return `🌸 Menu Anime 🌸

🎌 ${prefix}anime <nome>
🔎 Busca informações detalhadas de um anime.

🖼 ${prefix}animepic
🔁 Envia uma imagem aleatória de anime.

📖 ${prefix}quoteanime
💬 Receba uma frase inspiradora de algum personagem.

📺 ${prefix}waifu
❤ Receba uma imagem aleatória de uma waifu.

🔞 ${prefix}hentai
❗ Conteúdo +18 (restrito)

━━━━━━━━━━━━━━━━
Use: ${prefix}comando <argumento> se necessário.`;
};

module.exports = {
  menuAdm,
  menu,
  menuAnime
};