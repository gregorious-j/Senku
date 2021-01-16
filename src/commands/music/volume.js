const { prefix, COLOR_THEME } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');

module.exports = {
    name: 'volume',
    aliases: ['v', 'vol'],
    description: 'Change the player volume',
    usage: `\`${prefix}volume <1-100>`,
    permissionRequired: 0,
    args: false,
    default: {
        lock: true,
        permissionToUnlock: 2
    },
    category: 'music',
    execute(message, data) {
        const vc = message.member.voice.channel;
        const player = data.queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message.channel, 'ERROR', `<@${message.member.id}>, there is no active player.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message.channel, 'ERROR', `<@${message.member.id}>, You can't adjust this player's volume without joining the correct voice channel.`);
        }
        if(!data.args[0]) {
            return new ClientStatusMessage(message.channel, 'CUSTOM', `The volume is at \`${player.volume}%\``, `Volume`, COLOR_THEME);
        } else {
            let vol = parseInt(data.args[0]);
            if(vol) {
                player.setVolume(vol);
            }  else {
                return new ClientStatusMessage(message.channel, 'ERROR', `Please enter a valid number.`)
            }
        }
    }
}