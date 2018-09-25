const { RichEmbed } = require('discord.js');
const Command = require('../../base/command.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: 'user',
            category: 'misc',
            description: 'Returns various information about a user.',
            usage: '{prefix}user <user ID>',
            parameters: 'snowflakeUserID',
            extended_help: false,
            locked: false,
            aliases: ['whois', 'find', 'fetch']
        });
    };
    /**
     * @param {object} Message The received message object.
     */
    async run(message) {
        const { isValidUser } = this;
        if (!message.args[0]) return this.client.str(message, 'Please provide a user ID.');
        const fetchUser = await isValidUser(message.args[0], this.client);
        if (!fetchUser) return this.client.str(message, 'Invalid user ID provided. Try again.');
        const userObj = {
            username: fetchUser.username,
            _ID: fetchUser.id,
            tag: fetchUser.tag,
            avatar: fetchUser.displayAvatarURL,
            account: {
                _age: this.client.moment(fetchUser.createdAt).fromNow(),
                _created: this.client.moment(fetchUser.createdAt).format('dddd, MMMM Do, YYYY, hh:mm:ss A')
            },
            presence: {
                _status: fetchUser.presence.status,
                _game: {
                    name: fetchUser.game ? fetchUser.game.name : 'Not Playing a Game'
                }
            },
            bot: fetchUser.bot,
            db: {
                _hasInfractions: this.client.user_history.has(fetchUser.id),
                _totalInfractions: this.client.user_history.has(fetchUser.id) ? this.client.user_history.get(fetchUser.id).length : 'No Entries Found'
            }
        };
        const embed = new RichEmbed()
            .setColor(message.member.highestRole.hexColor)
            .setAuthor(userObj.username, userObj.avatar)
            .setDescription(`User's Account was Made On:\n> \`${userObj.account._created}\` (${userObj.account._age})`)
            .addField('Username', `${userObj.tag} (bot: __${userObj.bot}__)`, true)
            .addField('User ID', userObj._ID, true)
            .addField('User Presence', `\`\`\`Status: ${userObj.presence._status}\nGame: ${userObj.presence._game.name}\`\`\``)
            .addField('User Has Infractions Recorded in the Database?', userObj.db._hasInfractions)
            .addField('Total Infractions Found', userObj.db._totalInfractions)
            .setFooter(userObj.tag, userObj.avatar)
            .setTimestamp()
            .setThumbnail(userObj.avatar);
        const msg = await message.channel.send('Fetching user information...');
        return msg.edit(`Successfully fetched results for \`${userObj.tag}\``, embed);
    };

    isValidUser(user, client) {
        if (isNaN(parseInt(user))) return false;
        if (user.length !== 18) return false;
        return client.fetchUser(user).then(u => u).catch(() => { return false });
    };
};
