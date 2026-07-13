const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

const SALON_PIEGE_ID = 'METS_ICI_TON_ID_DE_SALON';

client.on('messageCreate', async (message) => {
  if (message.channel.id !== SALON_PIEGE_ID) return;
  if (message.author.bot) return;

  try {
    await message.delete();
    await message.member.ban({ reason: 'A écrit dans le salon interdit' });
    console.log(`Banni : ${message.author.tag}`);
  } catch (err) {
    console.error(err);
  }
});

client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
