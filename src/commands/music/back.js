const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');

module.exports = {
    name: 'back',
    aliases: [''],
    description: 'Go back one track',
    usage: `\`${prefix}back\``,
    permissionRequired: 0,
    args: false,
    category: 'music',
    execute(message, data) {
        const vc = message.member.voice.channel
        const player = data.queues.get(message.guild.id)
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `There is no active stream.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't play something without joining a voice channel.`)
        }
        player.back()
    }
}