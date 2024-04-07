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

client.on('messageDelete', (deletedMessage) => {
  console.log(
    `Message with ID ${deletedMessage.id} deleted in ${deletedMessage.channel}: "${deletedMessage.content}"`,
  );
  // You can perform any actions you want here, such as logging, sending a message, etc.
});

client.on('ready', () => {
  console.log(`${client.user.tag}에 로그인하였습니다!`);
});
