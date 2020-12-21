const { QueueInstance } = require('../../queue/serverQueue')
const { prefix } = require('../../../config.json')
const { ClientStatusMessage } = require('../../util/status')
const { COLOR_THEME } = require('../../../config.json')
const { Track } = require('../../queue/track')
const Discord = require('discord.js')

module.exports = {
    name: 'searchsc',
    aliases: ['sc'],
    description: `Search for music in SoundCloud with search terms`,
    usage: `searchsc <search terms>`,
    permissionRequired: 0,
    args: true,
    category: 'music',
    async execute(message, data) {
        const numOfResults = 6
        const query = data.args.join(' ')
        if (!data.manager) this.lavaplayer = await data.manager.create(message.guild.id)
        let results
        try {
            results = await data.manager.search("scsearch:" + query)
        } catch (error) {
            return new ClientStatusMessage(message, 'ERROR', error)
        }
        if (results.tracks[0]) {
            const options = []
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
                .setTitle('Soundcloud search results for "' + query + '"')
                .setDescription(list)
                .setTimestamp(Date.now())
            message.channel.send(searchEmbed)
        }
    }
}