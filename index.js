const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const http = require('http');

// Mini serveur web pour que Render considère le service comme actif
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot en ligne');
});
server.listen(process.env.PORT || 3000, () => {
  console.log('Serveur web de ping démarré');
});

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

const SALONS_PIEGE_IDS = ['1526206401561497670'];

client.on('messageCreate', async (message) => {
  if (!SALONS_PIEGE_IDS.includes(message.channel.id)) return;
  if (message.author.bot) return;

  const userId = message.author.id;
  const guild = message.guild;

  try {
    await message.delete();
    await message.member.ban({ reason: 'A écrit dans un salon interdit' });
    console.log(`Banni : ${message.author.tag}`);

    const channels = guild.channels.cache.filter(
      c => c.type === ChannelType.GuildText
    );

    for (const [, channel] of channels) {
      try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(m => m.author.id === userId);

        if (userMessages.size > 0) {
          await channel.bulkDelete(userMessages, true).catch(async () => {
            for (const [, msg] of userMessages) {
              await msg.delete().catch(() => {});
            }
          });
          console.log(`${userMessages.size} message(s) supprimé(s) dans #${channel.name}`);
        }
      } catch (err) {
        console.error(`Erreur dans le salon ${channel.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
