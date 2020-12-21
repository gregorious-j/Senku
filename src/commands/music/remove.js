const Discord = require("discord.js")
const { prefix, COLOR_THEME } = require('../../../config.json')

module.exports = {
    name: 'remove',
    description: 'Remove a track or tracks from the queue',
    usage: `remove <track #>, <track #>, ...`,
    permissionRequired: 0,
    args: true,
    category: 'music',
    execute(message, data) {
        const player = data.queues.get(message.guild.id)
        if(!player || player.tracks.length == 0) {
            embed = new Discord.MessageEmbed()
            .setTitle('Queue')
            .setDescription('There is no queue :sob:')
            .setColor(COLOR_THEME)
            message.channel.send(embed)
        } else {
            player.removeTracks(data.args).then(done => {
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