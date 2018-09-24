const { table } = require('table');

module.exports = class {
    constructor(client) {
        this.client = client;
    };

    async run() {
        console.log(`Connected to ${this.client.guilds.size} guilds!`);
    };
};