const { RichEmbed } = require('discord.js');

const Command = require('../../base/command.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: 'verbal',
            category: 'database',
            description: 'Adds a new verbal warning.',
            usage: '{prefix}verbal <user ID> <reason> | [guild ID] | [guild name] | [moderator ID]',
            parameters: 'snowflakeUserID, stringReason, snowflakeGuild',
            extended_help: false,
            locked: false,
            aliases: ['pong', 'ding', 'dong']
        });
    };
    /**
     * @param {object} Message The received message object.
     */
    async run(message) {
        const { fetchUser } = this;
        if (!message.args[0]) return this.client.help(message, 'verbal');
        const fetch = await fetchUser(message.args[0], this.client);
        if (!fetch) return this.client.str(message, 'Invalid user ID provided.');
        const reason = message.args.slice(1).join(' ');
        if (reason.length < 1) return this.client.str(message, 'You must provide a reason.');
        const user = {
            username: fetch.username,
            _ID: fetch.id,
            tag: `${fetch.username}#${fetch.discriminator}`,
            avatarURL: fetch.avatar
        };
        if (message.content.includes('|')) {
            const [ guild_name, guild_ID, mod_ID ] = message.content.split('|').slice(1);
            this.client.guild_history.ensure(guild_ID, []);
            this.client.user_history.ensure(fetch._ID, []);
            const modFetch = await fetchUser(mod_ID, this.client);
            if (!modFetch) return this.client.str(message, 'Invalid moderator ID provided.');
            const moderator = {
                username: modFetch.username,
                _ID: modFetch.id,
                tag: `${modFetch.username}#${modFetch.discriminator}`,
                avatarURL: modFetch.avatar
            };
            const g_history_push = {
                user: user,
                moderator: moderator,
                type: 'verbal',
                reason: reason,
                last_modified: [{
                    timestamp: this.client.moment().format('LLLL'),
                    user: message.author.id,
                    action: 'ADDED CASE'
                }]
            };
            const u_history_push = {
                type: 'verbal',
                reason: reason,
                guild: {
                    name: guild_name,
                    _ID: guild_ID
                },
                moderator: moderator,
                last_modified: [{
                    timestamp: this.client.moment().format('LLLL'),
                    user: message.author.id,
                    action: 'ADDED CASE'
                }]
            };
            const db = {
                case: this.client.database.get(message.guild.id).length === 1 ? 0 : this.client.database.get(message.guild.id).length - 1 ,
                type: 'verbal',
                reason: reason,
                guild: {
                    name: guild_name,
                    _ID: guild_ID
                },
                moderator: moderator,
                last_modified: [{
                    timestamp: this.client.moment().format('LLLL'),
                    user: message.author.id,
                    action: 'ADDED CASE'
                }]
            };
            this.client.guild_history.push(guild_ID, g_history_push);
            this.client.user_history.push(user._ID, u_history_push);
            this.client.database.push(message.guild.id, db);
            const embed = new RichEmbed()
                .setColor('fffb38')
                .setAuthor(user.tag)
                .setTitle(`Verbal Warning`)
                .addField('Case #', this.client.database.get(message.guild.id).length - 1, true)
                .addField('Username', user.tag, true)
                .addField('User ID', user._ID, true)
                .addField('Server Name', guild_name, true)
                .addField('Server ID', guild_ID, true)
                .addField('Reason', `\`\`\`${reason}\`\`\``)
                .setFooter(`Moderator: ${moderator.tag}`)
                .setTimestamp();
            return this.client.channels.get(message.setting.db_log).send(embed);
        } else {
            if (!this.client.user_history.has(user._ID)) this.client.user_history.set(user._ID, []);
            //this.client.user_history.ensure(user._ID, []);
            const u_history_push = {
                type: 'verbal',
                reason: reason,
                guild: {
                    name: 'no name provided',
                    _ID: 'no ID provided'
                },
                moderator: 'no moderator provided',
                last_modified: [{
                    timestamp: this.client.moment().format('LLLL'),
                    user: message.author.id,
                    action: 'ADDED CASE'
                }]
            };
            const db = {
                case: this.client.database.get(message.guild.id).length === 1 ? 0 : this.client.database.get(message.guild.id).length - 1,
                type: 'verbal',
                reason: reason,
                guild: {
                    name: 'no name provided',
                    _ID: 'no ID provided'
                },
                moderator: 'no moderator provided',
                last_modified: [{
                    timestamp: this.client.moment().format('LLLL'),
                    user: message.author.id,
                    action: 'ADDED CASE'
                }]
            };
            this.client.user_history.push(user._ID, u_history_push);
            this.client.database.push(message.guild.id, db);
            const embed = new RichEmbed()
                .setColor('fffb38')
                .setAuthor(user.tag)
                .setTitle(`Verbal Warning`)
                .addField('Case #', this.client.database.get(message.guild.id).length - 1 , true)
                .addField('Username', user.tag, true)
                .addField('User ID', user._ID, true)
                .addField('Reason', `\`\`\`${reason}\`\`\``)
                .setTimestamp();
            return this.client.channels.get(message.settings.db_log).send(embed);
        };
    };

    fetchUser(user, client) {
        if (isNaN(parseInt(user))) return false;
        if (user.length !== 18) return false;
        return client.fetchUser(user).then(u => u).catch(() => { return false });
    };
};