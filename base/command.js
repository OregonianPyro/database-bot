class Command {
    constructor(client, {
        name = null,
        category = null,
        description = null,
        usage = null,
        parameters = null,
        extended_help = false,
        locked = false,
        aliases = []
    }) {
        this.client = client;
        this.help = { name, category, description, usage, parameters, extended_help };
        this.conf = { locked, aliases };
    };
};

module.exports = Command;