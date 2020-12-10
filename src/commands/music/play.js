const { Queue } = require('../../queue/serverQueue');
const { prefix } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');


module.exports = {
    name: 'play',
    aliases: ['add'],
    description: `Play a music with search terms (YouTube by default) or a link (YouTube and SoundCloud supported with playlist support). `,
    usage: `\`${prefix}play <search terms or link>\``,
    permissionRequired: 0,
    flagDesc: 'set the video to play at a certain time with the flag "--" at the end of a link or search. (e.g. "--10m 55s")',
    args: true,
    category: 'music',
    async execute(message, args, queues, manager) {
        const voiceChannel = message.member.voice.channel;
        const queue = queues.get(message.guild.id);
        if (!voiceChannel) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't play something without joining a voice channel.`)
        } else {
            if (!queue) {
                const queue = new Queue(voiceChannel, message, manager);
                queues.set(message.guild.id, queue);
                await queue.join(true);
                queue.add(args, message);
            } else {
                queue.add(args, message);
            }
        }
    }
}