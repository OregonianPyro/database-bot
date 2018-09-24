const { Client, RichEmbed, Collection } = require('discord.js');
const Enmap = require('enmap');
const { promisify } = require('util');
const readdir = promisify(require("fs").readdir);
const klaw = require('klaw');
const path = require('path');
const { table } = require('table');
require('dotenv').config();
require('./utils/prototypes.js');
class DatabaseBot extends Client {
    constructor(options) {
        super(options);
        this.chalk = require('chalk');
        this.moment = require('moment');
        this.cmdsLoadError = [['Command Name', 'Error Message']];
        this.commands = new Collection();
        this.aliases = new Collection()
        this.settings = new Enmap({ name: 'settings' });
        this.guild_history = new Enmap({ name: 'guild_history' });
        this.user_history = new Enmap({ name: 'user_history' });
        this.database = new Enmap({ name: 'database' });
        this.notes = new Enmap({ name: 'notes' });
        /**
         * @param {object} client The client object.
         * @param {object} message The message object.
         * @param {string} command The command to obtain information for.
         */
        this.help = (message, command) => {
            let client = message.client;
            let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
            if (!cmd) throw new Error(`Command '${cmd}' not found.`);
            const embed = new RichEmbed()
                .setColor('BLUE')
                .setAuthor(`${client.user.username} | Command: ${cmd.help.name.split('')[0].toUpperCase()}${cmd.help.name.split('').slice(1).join('')}`, client.user.displayAvatarURL)
                .setDescription('`< >` denotes a __required__ parameter.\n`[ ]` denotes an optional parameter.')
                .addField('Description', cmd.help.description)
                .addField('Usage', cmd.help.usage.replaceAll('{prefix}', message.settings.prefix))
                .addField('Parameters', `\`\`\`${cmd.help.parameters}\`\`\``)
                .addField('Aliases', `\`[${cmd.conf.aliases.join(', ')}]\``);
            if (!cmd.help.extended) return message.delete(), message.channel.send(embed);
            embed.addField('Extended Help', cmd.help.extended_help);
            return message.delete(), message.channel.send(embed);
        };
        this.str = (msg, str) => msg.channel.send(`${msg.author} | ${str}`);
    };
    loadCommand(commandPath, commandName) {
        try {
            const props = new (require(`${commandPath}${path.sep}${commandName}`))(this);
            props.conf.location = commandPath;
            if (props.init) {
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                this.aliases.set(alias, props.help.name);
            });
            console.log(client.chalk.bgGreen(`Loaded the command ${props.help.name}`));
            return false;
        } catch (e) {
            console.log(client.chalk.bgRed(`Error Loading the Command ${commandName} | ${e.stack}`));
        };
    };
    async unloadCommand(commandPath, commandName) {
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else if (this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) return `The command \`${commandName}\` is not recognized by the bot.`;

        if (command.shutdown) {
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
        return false;
    };
};

const client = new DatabaseBot();

const init = async () => {
    klaw("./commands").on("data", (item) => {
        const cmdFile = path.parse(item.path);
        if (!cmdFile.ext || cmdFile.ext !== ".js") return;
        const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
        if (response) console.error(response);
    });

    const evtFiles = await readdir("./events/");
    console.log(`Loading a total of ${evtFiles.length} events`);
    evtFiles.forEach(file => {
        const eventName = file.split(".")[0];
        console.log(client.chalk.bgBlack.green(`Loaded the event ${eventName}`));
        const event = new (require(`./events/${file}`))(client);
        client.on(eventName, (...args) => event.run(...args));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
};

init();
client.login(process.env.TOKEN);

process.on('unhandledRejection', error => {
    console.error(`Uncaught Promise Error: \n${error.stack}`);
});

// const { Client, Collection } = require('discord.js');
// const Enmap = require('enmap');
// const fs = require('fs');
// require('dotenv').config();

// // class DatabaseBot extends Client {
// //     constructor(options) {
// //         super(options);
// //         this.chalk = require('chalk');
// //         this.moment = require('moment');
// //         this.str = (msg, str) => msg.channel.send(`${msg.author} | ${str}`);
// //         this.help = (msg, cmd) => msg.channel.send(`Incorrect usage. Run \`${msg.settings.prefix}help ${cmd}\` for help.`);
// //         this.commands = new Collection();
// //         this.aliases = new Collection();
// //         this.settings = new Enmap({ name: 'settings' });
// //         this.guild_history = new Enmap({ name: 'guild_history' });
// //         this.user_history = new Enmap({ name: 'user_history' });
// //         this.errors = new Enmap({ name: 'errors' });
// //     };
// // };

// const client = new DatabaseBot({ disableEveryone: true});
// client.login(process.env.TOKEN);

// fs.readdir('./commands', (err, files) => {
//     if (err) console.error(err.stack);
//     files.forEach(f => {
//         if (!f.endsWith('.js')) return;
//         const props = require(`./commands/${f}`);
//         client.commands.set(props.help.name, props);
//         props.conf.aliases.forEach(a => {
//             client.aliases.set(a, props.help.name);
//         });
//     });
// });

// fs.readdir('./events/', (err, files) => {
//     if (err) return console.error(err);
//     files.forEach(file => {
//         if (!file.endsWith('.js')) return;
//         const event = require(`./events/${file}`);
//         let eventName = file.split(".")[0];
//         client.on(eventName, event.bind(null, client));
//         delete require.cache[require.resolve(`./events/${file}`)];
//     });
// });

