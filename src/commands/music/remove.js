const Discord = require("discord.js")
const { prefix, COLOR_THEME } = require('../../../config.json')

module.exports = {
    name: 'remove',
    description: 'Remove a track or tracks from the queue',
    usage: `\`${prefix}remove <track #>, <track #>, ...\``,
    permissionRequired: 0,
    args: true,
    category: 'music',
    execute(message, args, queues) {
        const player = queues.get(message.guild.id)
        if(!player || player.tracks.length == 0) {
            embed = new Discord.MessageEmbed()
            .setTitle('Queue')
            .setDescription('There is no queue :sob:')
            .setColor(COLOR_THEME)
            message.channel.send(embed)
        } else {
            console.log(args);
            player.removeTracks(args).then(done => {
                const embed = new Discord.MessageEmbed()
                .setTitle('Removed Tracks')
                .setDescription(done)
                .setColor(COLOR_THEME)
                message.reply(embed)
            }, reject => {
                console.log(reject)
            })
        }
    }
}