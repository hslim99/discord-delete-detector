require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

exports.pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const imageDirectory = './images';
const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

client.login(process.env.TOKEN);

client.on('messageDelete', async (deletedMessage) => {
  const logChannel = client.channels.cache.get('1226415610791989329');

  if (!logChannel) {
    console.log('Logging failed due to an invalid logChannel!');
    return;
  }

  if (deletedMessage.channelId === process.env.TARGET_CHANNEL) {
    const imagePaths = Array.from(deletedMessage.attachments.values()).map((attachment) => {
      const attachmentURL = attachment.url;
      const fileExtension = path.extname(attachmentURL).split('?')[0].toLowerCase();
      const fileName = `${deletedMessage.id}${attachment.id}${fileExtension}`;

      const imagePath = path.join(imageDirectory, fileName);

      return imagePath;
    });
    logChannel.send({
      content: `${deletedMessage.author.username} (userId: ${deletedMessage.author.id}): ${deletedMessage.content}`,
      files: imagePaths,
    });
  }
  console.log(deletedMessage);
});

client.on('messageCreate', async (message) => {
  const logChannel = client.channels.cache.get('1226415610791989329');

  if (!logChannel) {
    console.log('Logging failed due to an invalid logChannel!');
    return;
  }

  if (message.channelId === process.env.TARGET_CHANNEL) {
    for (const attachment of Array.from(message.attachments.values())) {
      const attachmentURL = attachment.url;

      const fileExtension = path.extname(attachmentURL).split('?')[0].toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        message.reply(
          'Invalid file format. Please upload an image with a valid extension (.png, .jpg, .jpeg, .gif).',
        );
      }

      const maxSizeBytes = 25 * 1024 * 1024;
      if (attachment.size > maxSizeBytes) {
        message.reply('Image size exceeds the maximum allowed size of 25MB.');
      }

      if (!fs.existsSync(imageDirectory)) {
        fs.mkdirSync(imageDirectory);
      }

      const fileName = `${message.id}${attachment.id}${fileExtension}`;
      const filePath = path.join(__dirname, imageDirectory, fileName);

      try {
        const imageStream = fs.createWriteStream(filePath);
        const response = await axios.get(attachmentURL, { responseType: 'stream' });
        response.data.pipe(imageStream);
      } catch (e) {
        console.log(e);
      }
    }
  }
});

client.on('ready', () => {
  console.log(`${client.user.tag}에 로그인하였습니다!`);
});
