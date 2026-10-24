const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// --- خادم الويب (Express) لمنع انطفاء البوت على Render وتلبية شرط البورتات ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Kingdom Life Broadcast Bot is Alive and Running 24/7!');
});

app.listen(PORT, () => {
    console.log(`🌐 الويب سيرفر يعمل على البورت ${PORT}`);
});
// -----------------------------------------------------------------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    console.log('🚀 البوت متصل وجاهز للعمل 24/7!');
});

// أمر تجريبي بسيط للتأكد من استجابة البوت
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
        message.reply('🏓 Pong! البوت شغال ومتصل بنجاح على استضافة Render.');
    }
});

// تسجيل الدخول بالتوكن
client.login(process.env.TOKEN);