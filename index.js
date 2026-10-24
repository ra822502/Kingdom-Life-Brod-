const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    PermissionFlagsBits 
} = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);

    // تسجيل أمر البرودكاست في ديسكورد تلقائياً
    const broadcastCommand = new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('إرسال برودكاست لجميع أعضاء السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.create(broadcastCommand);
});

client.on('interactionCreate', async (interaction) => {
    
    // 1. عندما تكتب الأمر /broadcast
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'broadcast') {
            const modal = new ModalBuilder()
                .setCustomId('broadcast_modal')
                .setTitle('إعداد رسالة البرودكاست');

            const messageInput = new TextInputBuilder()
                .setCustomId('broadcast_message')
                .setLabel('اكتب الرسالة هنا:')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('اكتب نص البرودكاست الذي سيصل للأعضاء...')
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(messageInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }
    }

    // 2. عندما ترسل النافذة بالكتابة التي كتبتها
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'broadcast_modal') {
            const messageText = interaction.fields.getTextInputValue('broadcast_message');

            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_send')
                .setLabel('تأكيد الإرسال الآن 🚀')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(confirmButton);

            await interaction.reply({
                content: `**معاينة الرسالة:**\n${messageText}\n\n⚠️ هل أنت متأكد من إرسال هذه الرسالة لجميع الأعضاء؟`,
                components: [row],
                ephemeral: true
            });

            client.currentBroadcast = messageText;
        }
    }

    // 3. عندما تضغط على زر التأكيد الأخضر
    if (interaction.isButton()) {
        if (interaction.customId === 'confirm_send') {
            await interaction.update({ content: '⏳ جاري إرسال البرودكاست للأعضاء...', components: [] });

            const guild = interaction.guild;
            const members = await guild.members.fetch();
            const messageToSend = client.currentBroadcast;

            let successCount = 0;
            let failCount = 0;

            for (const [id, member] of members) {
                if (member.user.bot) continue; // يتخطى البوتات ولا يرسل لها

                try {
                    // يرسل المنشن مع رسالتك بالخاص
                    await member.send(`${member.toString()}\n\n${messageToSend}`);
                    successCount++;
                    // تأخير بسيط ثانية واحدة بين كل رسالة لمنع حظر البوت من ديسكورد
                    await new Promise(res => setTimeout(res, 1000));
                } catch (err) {
                    failCount++; // في حال كان العضو قافل الخاص
                }
            }

            await interaction.followUp({
                content: `✅ **تم الانتهاء من إرسال البرودكاست!**\n• تم الإرسال بنجاح: **${successCount}**\n• تعذر الإرسال (خاص مغلق): **${failCount}**`,
                ephemeral: true
            });
        }
    }
});

client.login(process.env.BOT_TOKEN);