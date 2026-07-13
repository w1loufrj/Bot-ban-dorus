const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

const SALON_PIEGE_ID = '1526206401561497670';

client.on('messageCreate', async (message) => {
  if (message.channel.id !== SALON_PIEGE_ID) return;
  if (message.author.bot) return;

  const userId = message.author.id;
  const guild = message.guild;

  try {
    await message.delete();
    await message.member.ban({ reason: 'A écrit dans le salon interdit' });
    console.log(`Banni : ${message.author.tag}`);

    // Parcourt tous les salons textuels du serveur
    const channels = guild.channels.cache.filter(
      c => c.type === ChannelType.GuildText
    );

    for (const [, channel] of channels) {
      try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(m => m.author.id === userId);

        if (userMessages.size > 0) {
          // bulkDelete ne marche que pour les messages < 14 jours
          await channel.bulkDelete(userMessages, true).catch(async () => {
            // Si bulkDelete échoue (messages trop vieux), suppression une par une
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
