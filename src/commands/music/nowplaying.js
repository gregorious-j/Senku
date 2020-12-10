const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');

module.exports = {
    name: 'nowplaying',
    aliases: ['np'],
    description: `Show the track currently playing.`,
    usage: `\`${prefix}nowplaying\``,
    permissionRequired: 0,
    cooldown: 2,
    args: false,
    category: 'music',
    async execute(message, args, queues) {
        const player = queues.get(message.guild.id);
        if (!player) return new ClientStatusMessage(message, 'ERROR', `There is no active stream.`);
        player.displayNowPlaying();
    }
}