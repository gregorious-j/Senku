const { prefix } = require('../../../config.json')
const { ClientStatusMessage } = require('../../util/status')
const { COLOR_THEME } = require('../../../config.json')
const { Track } = require('../../queue/track')
const Discord = require('discord.js')

module.exports = {
    name: 'searchyt',
    aliases: ['search', 'yt'],
    description: `Search for music in YouTube with search terms`,
    usage: `\`${prefix}searchyt <search terms>\``,
    permissionRequired: 0,
    args: true,
    category: 'music',
    async execute(message, args, queues, manager) {
        const numOfResults = 6
        const query = args.join(' ')
        if (!manager) this.lavaplayer = await manager.create(message.guild.id)
        let results
        try {
            results = await manager.search("ytsearch:" + query)
        } catch (error) {
            return new ClientStatusMessage(message, 'ERROR', error)
        }
        if (results) {
            const options = [];
            for (i = 0; i < numOfResults; i++) {
                const result = results.tracks[i]
                options.push(new Track(result.track, result.info, 0, message.author, false))
            }
            let list = ``;
            options.forEach((e, i) => {
                list += `\`${i + 1}:\` [${e.title}](${e.uri})\n`
            })
            const searchEmbed = new Discord.MessageEmbed()
                .setColor(COLOR_THEME)
                .setTitle('YouTube search results for "' + query + '"')
                .setDescription(list)
                .setTimestamp(Date.now())
            message.channel.send(searchEmbed)
        }
    }
}