const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot aktif!'));
app.listen(3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const CONFIG = {
    roles: {
        staff: "1515310837059817623",
        legal: "1515311263880577066",
        illegal: "1515311374484635789",
        management: "1515311056879091863",
        developer: "1515311413210386512",
        botYetkilisi: "1515320824641486878",
        kayitSorumlusu: "1509059139211497493"
    },
    channels: {
        log: "1513997207513075742",
        sonuc: "1514002334810902720",
        ticketKategori: "1515317198061834260"
    }
};

client.on('messageCreate', async message => {
    if (message.content === '!başvuru-panel' && message.member.roles.cache.has(CONFIG.roles.botYetkilisi)) {
        const embed = new EmbedBuilder().setTitle("📋 REDLİNE FAMİLY YETKİLİ ALIM").setDescription("Başvuru için butona tıklayın.").setColor(0x00FF00);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('basvuruyu_baslat').setLabel('Başvuruyu Başlat 📝').setStyle(ButtonStyle.Success));
        await message.channel.send({ embeds: [embed], components: [row] });
    }
    if (message.content === '!ticket' && message.member.roles.cache.has(CONFIG.roles.botYetkilisi)) {
        const embed = new EmbedBuilder().setTitle("🎫 L.A ROLEPLAY TİCKET DESTEK SİSTEMİ").setDescription("L.A RolePlay sunucusuna hoş geldiniz!\n\nBu panel üzerinden yetkili ekiple iletişime geçebilir, yaşadığınız sorunları bildirebilirsiniz.\n\n⏰ Mesai Saatleri\n24 / 7 Aktif.").setColor(0x0099FF);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('open_ticket_menu').setLabel('Buradan bir destek kategorisi seçiniz...').setStyle(ButtonStyle.Secondary));
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    // TICKET MANTIĞI
    if (interaction.isButton() && interaction.customId === 'open_ticket_menu') {
        const menu = new StringSelectMenuBuilder().setCustomId('ticket_select').setPlaceholder('Kategori Seçin').addOptions([
            { label: 'Genel Ticket', value: 'genel', emoji: '🎫' },
            { label: 'Legal Ticket', value: 'legal', emoji: '🚓' },
            { label: 'İllegal Ticket', value: 'illegal', emoji: '⚖️' },
            { label: 'Yönetim Ticket', value: 'yonetim', emoji: '👑' },
            { label: 'Bug & Hata Ticket', value: 'bug', emoji: '🤖' }
        ]);
        await interaction.reply({ components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        const catMap = {
            genel: { role: CONFIG.roles.staff }, legal: { role: CONFIG.roles.legal },
            illegal: { role: CONFIG.roles.illegal }, yonetim: { role: CONFIG.roles.management },
            bug: { role: CONFIG.roles.developer }
        };
        const cat = catMap[interaction.values[0]];
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            parent: CONFIG.channels.ticketKategori,
            permissionOverwrites: [{ id: interaction.guild.id, deny: ['ViewChannel'] }, { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] }, { id: cat.role, allow: ['ViewChannel', 'SendMessages'] }]
        });
        const embed = new EmbedBuilder().setDescription(`Merhaba <@${interaction.user.id}>, Ticket talebin oluşturuldu.\n\nLütfen detayları paylaş:\nTalep/Konu:\nOlayın açıklaması:\nKanıt:\n\nİlgilenen Birim: <@&${cat.role}>`).setColor(0x00FF00);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Üstlen').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.update({ content: '✅ Kanal oluşturuldu!', components: [] });
    }

    // YETKİLİ BAŞVURU MANTIĞI
    if (interaction.isButton() && interaction.customId === 'basvuruyu_baslat') {
        const modal = new ModalBuilder().setCustomId('yetkili_form').setTitle('Redline - Yetkili Başvuru');
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('form_soru').setLabel('Başvuru Detaylarını Yazın').setStyle(TextInputStyle.Paragraph).setRequired(true)));
        await interaction.showModal(modal);
    }
    
    if (interaction.isModalSubmit() && interaction.customId === 'yetkili_form') {
        const logKanal = interaction.guild.channels.cache.get(CONFIG.channels.log);
        await logKanal.send({ content: `Yeni başvuru: <@${interaction.user.id}>\nDetay: ${interaction.fields.getTextInputValue('form_soru')}` });
        await interaction.reply({ content: 'Başvurunuz iletildi!', ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'ticket_claim') {
        await interaction.reply(`Bu ticket <@${interaction.user.id}> tarafından üstlenildi!`);
        interaction.message.edit({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('claimed').setLabel('Üstlenildi').setStyle(ButtonStyle.Secondary).setDisabled(true), new ButtonBuilder().setCustomId('ticket_close').setLabel('Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒'))] });
    } else if (interaction.isButton() && interaction.customId === 'ticket_close') {
        await interaction.channel.delete();
    }
});

client.login("MTUxMzUzNzU0NTg5NDQ5NDM5Mg.GVlBEB.EQN5m6ojdztwCtbH1qd8VqOaS3cVQGRj0LdcK4");
