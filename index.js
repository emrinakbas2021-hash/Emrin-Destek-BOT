const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const CONFIG = {
    roles: {
        staff: "1515310837059817623",
        legal: "1515311263880577066",
        illegal: "1515311374484635789",
        management: "1515311056879091863",
        developer: "1515311413210386512",
        botYetkilisi: "1515320824641486878"
    },
    category: "1515317198061834260"
};

client.on('messageCreate', async message => {
    if (message.content === '!ticket') {
        if (!message.member.roles.cache.has(CONFIG.roles.botYetkilisi)) return;

        const embed = new EmbedBuilder()
            .setTitle("🎫 L.A ROLEPLAY TİCKET DESTEK SİSTEMİ")
            .setDescription("L.A RolePlay sunucusuna hoş geldiniz!\n\nBu panel üzerinden yetkili ekiple iletişime geçebilir, yaşadığınız sorunları bildirebilirsiniz.\n\nGereksiz ticket açmayınız. Yetkilileri etiketleyerek spam yapmayınız.\nSaygı kurallarına uygun davranınız. Ticket işleminiz tamamlandıktan sonra kanal kapatılacaktır.\n\nL.A RolePlay ekibi olarak sizlere en iyi deneyimi sunmak için buradayız.\n\n⏰ Mesai Saatleri\n24 / 7 Aktif.")
            .setColor(0x0099FF);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket_menu').setLabel('Buradan bir destek kategorisi seçiniz...').setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    // BURASI ÖNEMLİ: Butona basıldığında yeni bir mesaj atmak yerine direkt menü (ephemeral) açıyoruz.
    if (interaction.isButton() && interaction.customId === 'open_ticket_menu') {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Kategori Seçin')
            .addOptions([
                { label: 'Genel Ticket', description: 'Oyun içi genel şikayet ve sorularınız.', value: 'genel', emoji: '🎫' },
                { label: 'Legal Ticket', description: 'Legal oluşum talepleri.', value: 'legal', emoji: '🚓' },
                { label: 'İllegal Ticket', description: 'Aile, Kartel ve illegal sorunlar.', value: 'illegal', emoji: '⚖️' },
                { label: 'Yönetim Ticket', description: 'Founder veya Yönetim ile özel görüşme.', value: 'yonetim', emoji: '👑' },
                { label: 'Bug & Hata Ticket', description: 'Bot veya discord ile ilgili sorunlar.', value: 'bug', emoji: '🤖' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ content: 'Lütfen bir kategori seçiniz:', components: [row], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        const categoryMap = {
            genel: { role: CONFIG.roles.staff, name: 'Genel Ticket' },
            legal: { role: CONFIG.roles.legal, name: 'Legal Ticket' },
            illegal: { role: CONFIG.roles.illegal, name: 'İllegal Ticket' },
            yonetim: { role: CONFIG.roles.management, name: 'Yönetim Ticket' },
            bug: { role: CONFIG.roles.developer, name: 'Bug & Hata Ticket' }
        };
        const cat = categoryMap[interaction.values[0]];

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            parent: CONFIG.category,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: ['ViewChannel'] },
                { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                { id: cat.role, allow: ['ViewChannel', 'SendMessages'] }
            ]
        });

        const embed = new EmbedBuilder()
            .setDescription(`Merhaba <@${interaction.user.id}>, Ticket talebin başarıyla oluşturuldu.\n\nLütfen aşağıdaki bilgileri detaylı bir şekilde paylaş:\nTalep/Konu:\nOlayın açıklaması:\nVarsa ekran görüntüsü veya kanıt:\n\nBir yetkili en kısa sürede ticketınızla ilgilenecektir.\n\nİlgilenen Birim: <@&${cat.role}>`)
            .setColor(0x00FF00);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Üstlen').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.update({ content: '✅ Kategori seçildi, kanalınız oluşturuldu!', components: [] });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'ticket_claim') {
            await interaction.reply(`Bu ticket <@${interaction.user.id}> tarafından üstlenildi!`);
            interaction.message.edit({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_claimed').setLabel('Üstlenildi').setStyle(ButtonStyle.Secondary).setDisabled(true), new ButtonBuilder().setCustomId('ticket_close').setLabel('Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒'))] });
        } else if (interaction.customId === 'ticket_close') {
            await interaction.channel.delete();
        }
    }
});

client.login("MTUxMzUzNzU0NTg5NDQ5NDM5Mg.GVlBEB.EQN5m6ojdztwCtbH1qd8VqOaS3cVQGRj0LdcK4");
