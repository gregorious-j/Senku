const { prefix } = require("../../../config.json")
const Discord = require("discord.js")
const fs = require('fs');
const { Utilities } = require("../../util/utilities");
const { ClientStatusMessage } = require('../../util/status');
module.exports = {
    name: 'enable',
    aliases: ['unlock'],
    description: `Enables a locked command.`,
    usage: `enable <command>`,
    permissionRequired: 2,
    args: true,
    category: 'general',
    async execute(message, data) {
        if (!data.args.length) return message.channel.send(`You didn't pass any command to enable, ${message.author}!`);
        const commandName = data.args[0].toLowerCase();
        const commands = message.client.commands;
        const command = commands.get(commandName) 
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);
        

        if(Utilities.isCommandLocked(message, command.name)) {
            let permission;
            if(command.default) {
                permission = command.default.permissionToUnlock;
            } else {
                permission = 2;
            }
            if(Utilities.getPermissionLevel(message.member) >= permission) {
                const settings = require('../../../guildsettings.json');
                const filtered = settings[message.guild.id].lockedCommands.filter(name => name != command.name); 
                settings[message.guild.id].lockedCommands = filtered;
                Utilities.writeToSettings(settings);
                return new ClientStatusMessage(message, 'CUSTOM', `\`${command.name}\` has been unlocked.\n\n**Commands locked:** 
                    ${filtered.map(command => `\`${command}\``).join(', ')}`, 'Settings', '#40f76b')
            } else {
                return message.channel.send(`${message.author}, you do not have permission to unlock \`${command.name}\``);
            }
        } else {
            return message.channel.send(`${message.author}, \`${command.name}\` is not locked`);
        }
       
    }
}