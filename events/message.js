class Message {
    constructor(client) {
        this.client = client;
    };
    /**
     * @param {object} message The message object received via the Discord API.
     */
    async run(message) {
        this.client.settings.ensure(message.guild.id, {
            prefix: 'db-',
            actions_channel: null,
            announcements_channel: null
        });
        message.settings = this.client.settings.get(message.guild.id);
        if (message.author.bot) return;
        if (message.channel.type !== 'text') return;
        if (message.content.indexOf(message.settings.prefix) !== 0) return;
        message.args = message.content.split(' ').slice(1);
        let command = message.content.split(' ')[0].slice(message.settings.prefix.length).toLowerCase();
        command = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!command) return;
        if (command.help.category === 'developer' && message.author.id !== '312358298667974656') return;
        if (command.conf.locked && !['312358298667974656', '168604928133038080'].includes(message.author.id)) return;
        try {
            await command.run(message);
        } catch (e) {
            console.log(this.client.chalk.bgRed(`|| ERROR ||\n${e.stack}`));
            return message.channel.send(`:octagonal_sign: **Error: \`${e.message}\`**`);
        };
    };
};

module.exports = Message;