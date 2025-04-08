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

module.exports = { menu };
