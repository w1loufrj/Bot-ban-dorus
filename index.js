const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const dns = require('dns');
const express = require('express'); // 1. Import d'Express

dns.setDefaultResultOrder('ipv4first');

// --- 2. SERVEUR WEB POUR UPTIMEROBOT ---
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint HTTP que UptimeRobot va pinger
app.get('/', (req, res) => {
  res.send('Bot Discord Piège actif et en ligne 24/7 !');
});

app.listen(PORT, () => {
  console.log(`Serveur Web d'éveil démarré sur le port ${PORT}`);
});
// ----------------------------------------

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
    // 1. Suppression du message piège + Ban instantané
    await message.delete().catch(() => {});
    await message.member.ban({ 
      reason: 'A écrit dans un salon interdit',
      deleteMessageDays: 1 // Demande directement à Discord de supprimer ses messages des dernières 24h
    });
    console.log(`Banni : ${message.author.tag}`);

    // 2. Nettoyage ciblé dans les autres salons
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
    console.error('Erreur lors du traitement du piège:', err);
  }
});

client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN).catch((err) => {
  console.error('ERREUR DE CONNEXION:', err.message);
});
