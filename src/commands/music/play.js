const { Queue } = require('../../queue/serverQueue')
const { prefix } = require('../../../config.json')
const { ClientStatusMessage } = require('../../util/status')
const { Utilities } = require('../../util/utilities')

module.exports = {
    name: 'play',
    aliases: ['add'],
    description: `Play a music with search terms (YouTube by default) or a link. Supports YouTube, Soundcloud, Bandcamp, and Twitch.`,
    usage: `play <search terms or link>`,
    permissionRequired: 0,
    args: true,
    category: 'music',
    async execute(message, data) {
        const voiceChannel = message.member.voice.channel;
        const queue = data.queues.get(message.guild.id);
        if (!voiceChannel) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't play something without joining a voice channel.`)
        } else {
            if (!queue) {
                const queue = new Queue(voiceChannel, message, data.manager)
                data.queues.set(message.guild.id, queue);
                await queue.join(true);
                queue.add(data.args, message).then(q => {
                    q.beginPlayback();
                });
            } else {
                queue.add(data.args, message);
            }
        
        }
    }
}