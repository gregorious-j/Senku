const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');


module.exports = {
    name: 'repeat',
    aliases: ['loop'],
    description: `Put the current track on or off repeat.`,
    usage: `\`${prefix}repeat\``,
    permissionRequired: 0,
    args: false,
    category: 'music',
    async execute(message, args, queues) {
        const vc = message.member.voice.channel;
        const player = queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no track to repeat!`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't repeat something without joining the correct voice channel.`);
        }
        player.toggleRepeat();
        // 
        if(player.repeat == false) {
            message.react('▶️');
        } else {
            message.react('🔁');
        }
        
    }
}