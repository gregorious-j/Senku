const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');


module.exports = {
    name: 'stop',
    aliases: ['disconnect', 'leave', 'dc'],
    description: 'Stop the playback of audio and reset the queue',
    usage: `\`${prefix}stop\``,
    permissionRequired: 0,
    args: false,
    category: 'music',
    execute(message, args, queues) {
        const vc = message.member.voice.channel;
        const player = queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no player to stop.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't stop this player without joining the correct voice channel.`);
        }
        try {
            player.stop();
            queues.delete(message.guild.id);
            message.react('👍')
        } catch (error) {
            
        }
        
    }
}