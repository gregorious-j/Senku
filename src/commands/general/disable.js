const { prefix } = require("../../../config.json")
const Discord = require("discord.js")
const fs = require('fs');
const { Utilities } = require("../../util/utilities");
const { ClientStatusMessage } = require('../../util/status');
module.exports = {
    name: 'disable',
    aliases: ['lock'],
    description: `Disables a command.`,
    usage: `disable <command>`,
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
        if(command.name == 'enable') return message.channel.send(`Nice try bucko`);

        if(!Utilities.isCommandLocked(message, command.name)) {
            let permission;
            if(command.default) {
                permission = command.default.permissionToUnlock;
            } else {
                permission = 2;
            }
            if(Utilities.getPermissionLevel(message.member) >= permission) {
                const settings = require('../../../guildsettings.json');
                settings[message.guild.id].lockedCommands.push(command.name); 
                const locked = settings[message.guild.id].lockedCommands;
                Utilities.writeToSettings(settings);
                return new ClientStatusMessage(message, 'CUSTOM', `\`${command.name}\` locked.\n\n**Commands locked:** 
                    ${locked.map(command => `\`${command}\``).join(', ')}`, 'Settings', '#40f76b')
            } else {
                return message.channel.send(`${message.author}, you do not have permission to lock \`${command.name}\``);
            }
        } else {
            return message.channel.send(`${message.author}, \`${command.name}\` is already locked`);
        }
       
    }
}