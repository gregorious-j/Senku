const Discord = require("discord.js")
const fs = require('fs')
const { COLOR_THEME, SPECIAL_GUILDS } = require('../../../config.json');
const { Utilities } = require("../../util/utilities");

module.exports = {
    name: 'inspo',
    aliases: ['cheermeup'],
    description: `Get a random Dhar Mann daily inspirational quote`,
    guildLock: SPECIAL_GUILDS,
    usage: `inspo`,
    permissionRequired: 0,
    cooldown: 60,
    args: false,
    category: 'fun',
    async execute(message, data) {
        const embed = new Discord.MessageEmbed()
        const inspo = JSON.parse(fs.readFileSync(process.cwd().replace(/\\/g, '/') + "/../quotes.json", "utf-8")).inspo
        const inspoIndex = Utilities.getRandomInt(0, inspo.length)
        embed.setColor(COLOR_THEME).addField(inspo[inspoIndex].date, inspo[inspoIndex].text)
        message.channel.send(embed)
    }
}