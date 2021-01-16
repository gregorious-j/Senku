const { prefix } = require("../../../config.json")
const Discord = require("discord.js")
const fs = require('fs');
const { Utilities } = require("../../util/utilities");
const { ClientStatusMessage } = require('../../util/status');
module.exports = {
    name: 'account',
    aliases: ['acc', "a"],
    description: `View your account.`,
    usage: `account`,
    permissionRequired: 0,
    category: 'fun',
    async execute(message, data) {
        const accounts = Utilities.readFile('accounts.json');
        if(!accounts[message.author.id]) {
            accounts[message.author.id] = {
                coins: 1000,
                xp: 0,
                level: 1
            }
            Utilities.writeToFile(accounts, 'accounts.json');
        
        }
        const userAccount = accounts[message.author.id];
        const embed = new Discord.MessageEmbed().setColor('#e61e5d')
            .setTitle(`${message.author.username}'s Account **『${userAccount.level}』**`)
            .addField('Sen₭oin', `\`${userAccount.coins}₭\``, true)
            .addField('XP', `\`${userAccount.xp}\`${Utilities.progressBar(26, userAccount.level * 100 * 2, userAccount.xp)}\`${userAccount.level * 100 * 2}\`\n→ **Level ${userAccount.level+1}**`)
            .setFooter('これは爽快です')
            .setTimestamp(Date.now());
        message.channel.send(embed);
    }
}