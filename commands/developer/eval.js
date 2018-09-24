const Command = require('../../base/command.js');
const { RichEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            category: 'developer',
            description: 'Evaluates JavaScript code.',
            usage: '{prefix}eval [code]',
            parameters: 'stringCode',
            extended_help: false,
            locked: false,
            aliases: ['e', 'ev']
        });
    };
    /**
     * @param {object} Message The received message object.
     */
    async run(message) {
        let flag;
        if (message.content.includes('--')) {
            flag = message.content.split('--')[1];
        } else {
            flag = null
        };
        if (flag === null) {
            const content = message.content.split(' ').slice(1).join(' ');
            const result = new Promise((resolve, reject) => resolve(eval(content)));
            return result.then(async output => {
                if (typeof output !== 'string') output = require('util').inspect(output, {
                    depth: 0
                });
                if (output.includes(process.env.TOKEN)) output = output.replace(process.env.TOKEN, '[TOKEN]');
                let toolong = new RichEmbed()
                    .setColor("GOLD")
                    .setTitle("Eval Success")
                    .setDescription(`:warning: **Length too long, check console.**`)
                if (output.length > 2000) return console.log(output), message.channel.send(toolong);
                let success = new RichEmbed()
                    .setColor("GREEN")
                    .addField(`**Eval Success**`, `\`\`\`${output}\`\`\``)
                return message.channel.send(success)
            }).catch(err => {
                console.error(err);
                err = err.toString();

                if (err.includes(process.env.TOKEN)) err = err.replace(process.env.TOKEN, '[TOKEN]');
                let error = new RichEmbed()
                    .setColor("RED")
                    .addField(`**Eval Fail**`, `\`\`\`${err}\`\`\``)
                return message.channel.send(error);
            });
        };
        if (flag.toLowerCase() === 'silent') {
            let content = message.content.split(' ').slice(1).join(' ').split('--')[0];
            const result = new Promise((resolve, reject) => resolve(eval(content)));
            return result.then(async output => {
                if (typeof output !== 'string') output = require('util').inspect(output, {
                    depth: 0
                });
                if (output.includes(process.env.TOKEN)) output = output.replace(process.env.TOKEN, '[TOKEN]');
                let toolong = new RichEmbed()
                    .setColor("GOLD")
                    .setTitle("Eval Success")
                    .setDescription(`:warning:**Length too long, check console.**`)
                if (output.length > 2000) return console.log(output), message.channel.send(toolong);
                let success = new RichEmbed()
                    .setColor("GREEN")
                    .addField(`**Eval Success**`, `\`\`\`${output}\`\`\``)
                await message.channel.send(success);
                return message.channel.bulkDelete(1);
            }).catch(err => {
                console.error(err);
                err = err.toString();

                if (err.includes(process.env.TOKEN)) err = err.replace(process.env.TOKEN, '[TOKEN]');
                let error = new RichEmbed()
                    .setColor("RED")
                    .addField(`*Eval Fail**`, `\`\`\`${err}\`\`\``)
                return message.channel.send(error);
            });
            //silent
        };
    };
};