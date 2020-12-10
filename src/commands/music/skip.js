const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');


module.exports = {
    name: 'skip',
    aliases: ['next', 'goto'],
    description: 'Skip to the next (or specified) track. If position is omitted, Senku will skip to the next track.',
    usage: `\`${prefix}skip <position>`,
    permissionRequired: 0,
    args: false,
    category: 'music',
    execute(message, args, queues) {
        const vc = message.member.voice.channel;
        const player = queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no queue to skip through.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't skip something without joining the correct voice channel.`);
        }
        if(args[0]) {
            let trackNum = parseInt(args[0]);
            player.skip(trackNum-1, true);
        } else {
            player.skip('next', true);
        }
        
    }
}