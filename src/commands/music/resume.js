const { prefix } = require('../../../config.json')
const { ClientStatusMessage } = require('../../util/status')

module.exports = {
    name: 'resume',
    description: `Resume the current track`,
    usage: `resume`,
    permissionRequired: 0,
    args: false,
    category: 'music',
    async execute(message, data) {
        const vc = message.member.voice.channel
        const player = data.queues.get(message.guild.id)
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no player to resume!`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't resume something without joining the correct voice channel.`)
        }
        player.resume()
    }
}