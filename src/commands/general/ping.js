const { COLOR_THEME } = require('../../../config.json')

module.exports = {
    name: 'ping',
    aliases: ['uptime', 'api', 'server'],
    description: `Ping Senku!`,
    usage: `ping`,
    permissionRequired: 0,
    cooldown: 5,
    args: false,
    category: 'general',
    async execute(message, data) {
        let botMsg = await message.channel.send("〽️ Pinging")
        botMsg.edit({
            embed: {
                title: "Pong! 🏓",
                description: [
                    "**Server**: `" + (botMsg.createdAt - message.createdAt) + "ms`",
                    "**API**: `" + Math.round(message.client.ws.ping) + "ms`",
                    "**Uptime**: `" + msToTime(message.client.uptime) + "`"
                ].join("\n"),
                color: COLOR_THEME,
                footer: { text: "Requested by " + message.author.tag, icon_url: message.author.displayAvatarURL },
                timestamp: new Date()
            }
        }).catch(() => botMsg.edit("🆘 An unknown error occurred."))
    }
}

const msToTime = (ms) => {
    days = Math.floor(ms / 86400000) // 24*60*60*1000
    daysms = ms % 86400000 // 24*60*60*1000
    hours = Math.floor(daysms / 3600000) // 60*60*1000
    hoursms = ms % 3600000; // 60*60*1000
    minutes = Math.floor(hoursms / 60000) // 60*1000
    minutesms = ms % 60000 // 60*1000
    sec = Math.floor(minutesms / 1000)

    let str = ""
    if (days) str = str + days + "d"
    if (hours) str = str + hours + "h"
    if (minutes) str = str + minutes + "m"
    if (sec) str = str + sec + "s"

    return str
}