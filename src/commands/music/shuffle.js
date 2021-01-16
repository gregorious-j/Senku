const { prefix, COLOR_THEME } = require('../../../config.json')
const { ClientStatusMessage } = require('../../util/status')

module.exports = {
    name: 'shuffle',
    aliases: [''],
    description: `Shuffle the current queue`,
    usage: `shuffle`,
    permissionRequired: 0,
    args: false,
    category: 'music',
    async execute(message, data) {
        const vc = message.member.voice.channel
        const player = data.queues.get(message.guild.id)
        if(!player) {
            return message.channel.send(new ClientStatusMessage('ERROR', `<@${message.member.id}>, there is no queue to shuffle.`).create());
        }
        if (vc != player.getVoiceChannel()) {
            return message.channel.send(new ClientStatusMessage('ERROR', `<@${message.member.id}>, You can't shuffle the queue without joining the correct voice channel.`).create());
        }
        player.shuffle();
        return message.channel.send(new ClientStatusMessage('CUSTOM', `<@${message.author.id}> shuffled the queue`, 'Shuffle', COLOR_THEME).create());
    }
}