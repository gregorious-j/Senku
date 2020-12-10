const { COLOR_THEME } = require('../../../config.json')
const Discord = require('discord.js')
const os = require('os-utils')
const { Utilities } = require('../../util/utilities')

module.exports = {
    name: 'stats',
    aliases: ['statistics', 'process'],
    description: `Get Senku's statistics`,
    usage: `stats <query>`,
    permissionRequired: 0,
    args: false,
    category: 'general',
    execute(message, args, queues, manager) {
        const embed = new Discord.MessageEmbed()
            .setColor(COLOR_THEME)
            .setDescription('Profiling...')
        message.channel.send(embed).then(m => {
            os.cpuUsage(v => {
                const stats = {
                    cpu: (v*100).toFixed(2),
                    ram: (process.memoryUsage().heapUsed/1e6).toFixed(2),
                    uptime: os.sysUptime()*1000,
                    platform: os.platform()
                } 
                m.edit(new Discord.MessageEmbed()
                .setTitle('Senku Stats')
                .setColor(COLOR_THEME)
                .addField('CPU Usage', `\`${stats.cpu}%\``)
                .addField('RAM Usage', `\`${stats.ram}MB\``)
                .addField('System Uptime', `\`${Utilities.format(stats.uptime)}\``)
                .addField('Platform', `\`${stats.platform}\``));
                Utilities.log(`\nCPU: ${stats.cpu}%\nRAM: ${stats.ram}MB\nUptime: ${Utilities.format(stats.uptime)}\nPlatform: ${stats.platform}`)
            })
        })
    }
}