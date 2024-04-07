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
exports.pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client.login(process.env.TOKEN);

client.on('messageDelete', async (deletedMessage) => {
  const logChannel = client.channels.cache.get('1226415610791989329');

  if (!logChannel) {
    console.log('Logging failed due to an invalid logChannel!');
    return;
  }

  if (deletedMessage.channelId === process.env.TARGET_CHANNEL) {
    const attachmentURLs = Array.from(deletedMessage.attachments.values()).map(
      (attachment) => attachment.url,
    );
    logChannel.send({
      content: `${deletedMessage.author.username} (userId: ${deletedMessage.author.id}): ${deletedMessage.content}`,
      files: attachmentURLs,
    });
  }
  console.log(deletedMessage);
});

client.on('ready', () => {
  console.log(`${client.user.tag}에 로그인하였습니다!`);
});
