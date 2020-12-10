const { prefix, COLOR_THEME } = require('../../../config.json')
const { ClientStatusMessage } = require('../../util/status')

module.exports = {
    name: 'shuffle',
    aliases: [''],
    description: `Shuffle the current queue`,
    usage: `\`${prefix}shuffle\``,
    permissionRequired: 0,
    args: false,
    category: 'music',
    async execute(message, args, queues) {
        const vc = message.member.voice.channel
        const player = queues.get(message.guild.id)
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no queue to shuffle.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't shuffle the queue without joining the correct voice channel.`)
        }
        player.shuffle()
        return new ClientStatusMessage(message, 'CUSTOM', `<@${message.author.id}> shuffled the queue`, 'Shuffle', COLOR_THEME)
    }
}