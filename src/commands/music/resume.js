const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');


module.exports = {
    name: 'resume',
    aliases: ['r'],
    description: `Resume the current track.`,
    usage: `\`${prefix}resume\``,
    permissionRequired: 0,
    args: false,
    category: 'music',
    async execute(message, args, queues) {
        const vc = message.member.voice.channel;
        const player = queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no player to resume!`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't resume something without joining the correct voice channel.`);
        }
        player.resume();
    }
}