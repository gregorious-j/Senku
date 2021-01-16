const Discord = require('discord.js')
const { COLOR_THEME, defaultPrefix } = require('../../../config.json')
const fs = require('fs')
const { Utilities } = require('../../util/utilities')

module.exports = {
    name: 'help',
    aliases: ['senku'],
    description: 'List all of my commands or info about a specific command.',
    usage: `help`,
    permissionRequired: 0,
    args: false,
    category: 'general',
    execute(message, data) {
        // fetch guild prefix or use default if it has not been changed
        const settings = require('../../../guildsettings.json');
        if(!settings[message.guild.id]) {
            settings[message.guild.id] = {
              prefix: defaultPrefix
         }
        }
        const prefix = settings[message.guild.id].prefix;
        const embed = new Discord.MessageEmbed();
        const { commands } = message.client;

        // Return formatted list of all commands in the specified category

        const returnCommandsInCatagory = cat => {
            let commandList = [];
            commands.forEach(e => {
                if(e.lock) {
                    if(e.lock.status == true) return;
                }
                if(e.category == cat && Utilities.getPermissionLevel(message.member) >= e.permissionRequired) {
                    commandList.push(`\`${e.name}\``);
                    totalCommmands++;
                }
            });
            return commandList.join(', ');
        }
        
        // Begin with no command categories
        const categories = [];
        let totalCommmands = 0;
        // Detect and add each category to the category dictionary

        commands.forEach(command => {
            if(!categories.includes(command.category)) categories.push(command.category);
        });

        // If there are no arguments send the default help message

        if (!data.args.length) {
            embed
                .setColor(COLOR_THEME)
                .setTitle(`Help`)
                .setTimestamp(Date.now())
                .setFooter(message.guild.name)
            categories.forEach(cat => {
                embed.addField(cat, returnCommandsInCatagory(cat))
            });

            embed.setDescription(`There are currently **${totalCommmands}** commands available for <@${message.author.id}>.\n Use \`${prefix}help <command>\` to get information on a specific command!`);
            return message.reply(embed);
        }

        // otherwise try to send the command-specific message

        const name = data.args[0].toLowerCase()
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }
        if(Utilities.getPermissionLevel(message.member) < command.permissionRequired) {
            embed.setTitle(command.name).setDescription('You do not have permission to use this command.');
            return message.reply(embed);
        }
        // Check if certain command info fields exist and add them to the embed
        embed.setTitle(`${command.name}${command.disabled ? '`[disabled]`' : ''}`);
        if (command.aliases)     embed.addField(`Aliases`, `${command.aliases.join(', ')}`);
        if (command.description) embed.addField(`Description`, `${command.description}`);
        if (command.usage)       embed.addField(`Usage`, `${prefix}${command.usage}`);
        if (command.lock)        embed.setDescription('This command is disabled in this guild.');
        embed.setColor(COLOR_THEME);
        embed.addField(`**Cooldown**`, `${command.cooldown || 3} second(s)`)
        message.reply(embed)

        
    }
}