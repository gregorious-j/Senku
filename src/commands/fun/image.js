
const gis = require('g-i-s');
const { prefix } = require("../../../config.json");
const Discord = require("discord.js");
const { Utilities } = require('../../util/utilities');

module.exports = {
    name: 'image',
    description: `Searches and sends the image result.`,
    usage: `\`${prefix}image <search terms>`,
    permissionRequired: 0,
    cooldown: 3,
    args: true,
    category: 'fun',
    async execute(message, args, queues) {
        await gis(args.join(' '), (error, results) => {
            if (error) {
                Utilities.log(error)
            }
            else {
                try {
                    const embed = new Discord.MessageEmbed().setImage(results[0].url).setColor('#03fcc2')
                    message.channel.send(embed)
                } catch(e) {
                    Utilities.log(e)
                }
            }
        })
    }
}