const play = require("play-dl");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const { MessageMedia } = require("whatsapp-web.js");
const path = require("path");

// Configura o ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = {
  name: "play",
  description: "Toca uma música do YouTube pelo nome.",
  async execute(client, message, args) {
    if (!args || args.length === 0) {
      return message.reply("❌ Escreva o nome da música! Ex: !play faded");
    }

    const searchQuery = args.join(" ");

    try {
      const result = await play.search(searchQuery, { limit: 1 });
      if (!result || result.length === 0) {
        return message.reply("❌ Música não encontrada.");
      }

      const video = result[0];
      const stream = await play.stream(video.url);

      const outputFile = path.resolve(__dirname, `../temp/audio_${Date.now()}.mp3`);

      // Converte para MP3
      ffmpeg(stream.stream)
        .audioBitrate(128)
        .format("mp3")
        .on("end", async () => {
          const media = MessageMedia.fromFilePath(outputFile);
          await message.reply(`🎶 Tocando: *${video.title}*`);
          await client.sendMessage(message.from, media);
          fs.unlinkSync(outputFile); // apaga depois de enviar
        })
        .on("error", (err) => {
          console.error("Erro ao converter áudio:", err);
          message.reply("❌ Erro ao processar o áudio.");
        })
        .save(outputFile);
    } catch (error) {
      console.error("Erro ao buscar ou tocar música:", error);
      message.reply("❌ Ocorreu um erro ao tentar tocar a música.");
    }
  },
};
