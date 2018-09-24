const Command = require('../../base/command.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            category: 'bot',
            description: 'Checks the bot\'s connection.',
            usage: '{prefix}ping',
            parameters: 'None',
            extended_help: false,
            locked: false,
            aliases: ['pong', 'ding', 'dong']
        });
    };
    /**
     * @param {object} Message The received message object.
     */
    async run(message) {
        return message.channel.send('Pinging...').then(m => {
            m.edit(`${message.author} | API: ${this.client.ping.toFixed()}ms -- Latency: ${m.createdTimestamp - message.createdTimestamp}ms`);
        });
    };
};