const Discord = require('discord.js')
const { COLOR_THEME, defaultPrefix } = require('../../../config.json')
const fs = require('fs')
module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: `help`,
    permissionRequired: 0,
    args: false,
    category: 'general',
    execute(message, args, queues, manager) {
        const embed = new Discord.MessageEmbed()
        const { commands } = message.client;
        const categories = [];
        const prefixes = JSON.parse(fs.readFileSync(process.cwd().replace(/\\/g, '/') + "/../guildsettings.json", 'utf8'));
        if(!prefixes[message.guild.id]) {
            prefixes[message.guild.id] = {
               prefix: defaultPrefix
            }
        }
        const prefix = prefixes[message.guild.id].prefix
        const returnCommandsInCatagory = cat => {
            let commandList = []
            commands.forEach(e => {
                if(e.category == cat) commandList.push(`\`${e.name}\``)
            })
            return commandList.join(', ')
        }
        commands.forEach(command => {
            if(!categories.includes(command.category)) categories.push(command.category)
        })
        if (!args.length) {
            embed
            .setColor(COLOR_THEME)
            .setTitle(`Help`)
            .setDescription(`There are currently **${commands.size}** commands available. Use \`${prefix}help <command>\` to get information on a specific command!`)
            .setTimestamp(Date.now())
            .setFooter(message.guild.name)
            categories.forEach(cat => {
                embed.addField(cat, returnCommandsInCatagory(cat))
            })
            return message.reply(embed);
        }
        const name = args[0].toLowerCase()
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

        if (!command) {
            return message.reply('that\'s not a valid command!')
        }
        if(command.guildLock) {
            if(!command.guildLock.includes(message.guild.id)) {
                return message.reply('that\'s not a valid command!')
            }
        }
        if(command.permissionRequired == 5) {
            embed.setTitle(command.name).setDescription('This is a restricted command.')
            return message.reply(embed)
        }
        embed.setTitle(`${command.name}${command.disabled ? '`[currently disabled]`' : ''}`)
        if (command.aliases) embed.addField(`Aliases`, `${command.aliases.join(', ')}`)
        if (command.description) embed.addField(`Description`, `${command.description}`)
        if (command.usage) embed.addField(`Usage`, `${prefix}${command.usage}`)
        if (command.flagDesc) embed.addField(`Flag`, `${command.flagDesc}`)
        if (command.guildLock) embed.addField(`Allowed Guilds`, `\`${command.guildLock.join('\n')}\``)
        embed.setColor(COLOR_THEME)
        embed.addField(`**Cooldown**`, `${command.cooldown || 3} second(s)`)

        message.reply(embed)
    }
}