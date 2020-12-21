const { prefix } = require("../../../config.json")
const Discord = require("discord.js")
const fs = require('fs');
const { Utilities } = require("../../util/utilities");
module.exports = {
    name: 'settings',
    description: `View your guild's Senku settings.`,
    usage: `settings`,
    permissionRequired: 0,
    args: false,
    category: 'general',
    async execute(message, data) {
        const settings = Utilities.getGuildSettings(message.guild.id);
        const embed = new Discord.MessageEmbed().setTitle('Settings');
        for(field in settings) {
            console.log(field);
            embed.addField(`${field}`, `${settings[field]}`)
        }
        embed.setTimestamp(Date.now());
        embed.setColor('#40f76b')
        message.channel.send(embed);
    }
}