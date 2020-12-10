const { prefix, COLOR_THEME } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');

module.exports = {
    name: 'volume',
    aliases: ['v', 'vol'],
    description: 'Change the player volume',
    usage: `\`${prefix}volume <1-100>`,
    permissionRequired: 2,
    args: false,
    category: 'music',
    execute(message, args, queues) {
        const vc = message.member.voice.channel;
        const player = queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no active player.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't adjust this player's volume without joining the correct voice channel.`);
        }
        if(!args[0]) {
            return new ClientStatusMessage(message, 'CUSTOM', `The volume is at \`${player.volume}%\``, `Volume`, COLOR_THEME);
        } else {
            let vol = parseInt(args[0]);
            if(vol) {
                player.setVolume(vol);
            }  else {
                return new ClientStatusMessage(message, 'ERROR', `Please enter a valid number.`)
            }
        }
        
    }
}