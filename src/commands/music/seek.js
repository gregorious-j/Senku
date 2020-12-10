const { prefix, COLOR_THEME } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');

module.exports = {
    name: 'seek',
    aliases: ['jump'],
    description: `Seek the player to the given time. Seek will only allow time in hours, minutes, and seconds. Can be colon separated or spelled out (e.g. 2 minutes 15 seconds/2m 15s)`,
    usage: `\`${prefix}seek <time>\``,
    permissionRequired: 0,
    args: true,
    category: 'music',
    execute(message, args, queues) {
        const vc = message.member.voice.channel;
        const player = queues.get(message.guild.id);
        if(!player) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, there is no player to seek.`)
        }
        if (vc != player.getVoiceChannel()) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't seek without joining the correct voice channel.`);
        }
        let time = args.join(' ');
        player.seek(time).then(time_ms => {
            player.displayNowPlaying(time_ms);
        }, fail => {
            message.reply(`couldn't seek the player.`); 
        })
    }
}