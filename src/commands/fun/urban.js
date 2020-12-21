const { prefix, COLOR_THEME } = require('../../../config.json')
const urban = require('urban')
const Discord = require('discord.js')

module.exports = {
    name: 'urban',
    aliases: ['urbandictionary', 'define'],
    description: `Get the Urban Dictionary definition of a search!`,
    usage: `\`${prefix}urban <query>\``,
    permissionRequired: 0,
    args: true,
    category: 'fun',
    execute(message, data) {
        const query = urban(data.args.join(' '));
        query.first(json => {
            if(json) {
                try {
                    const embed = new Discord.MessageEmbed()
                    .setColor(COLOR_THEME)
                    .setTitle(json.word)
                    .setDescription(json.definition.replace(/([[-\]])+/g, ''))
                    if(json.example.length >= 1024) {
                       embed.addField('Example', json.example.replace(/([[-\]])+/g, '').substring(0, 1020) + '...');
                    } else {
                        embed.addField('Example', json.example.replace(/([[-\]])+/g, ''))
                    }
                    message.channel.send(embed); 
                } catch (error) {
                    console.error(error);
                    message.reply('there was an error encountered when sending this definition')
                }
            } else {
                message.reply('there was no definition found :(')
            }
        })
    }
}