
const Discord = require("discord.js");
const toTime = require("to-time/src/ToTime");
const { COLOR_THEME } = require('../../../config.json');
const { ClientStatusMessage } = require('../../util/status');
const { Utilities } = require("../../util/utilities");

// 1️⃣2️⃣3️⃣4️⃣5️⃣✔❌🗳

module.exports = {
    name: 'poll',
    aliases: ['vote'],
    description: `Create a poll. Separate your arguments with commas (Make sure the title and options do not contain commas). If the embed is yellow, you can still cast your vote.`,
    usage: `poll <title>, <voting time>, <option_1>, ... <option_10>`,
    permissionRequired: 0,
    cooldown: 60,
    args: true,
    category: 'fun',
    async execute(message, args, queues, manager) {
        const parameters = args.join(' ').split(',')
        const maxOptions = 10
        const defaultTime = 60000
        let inLine = false;
        if(!parameters[2] || parameters.includes('')) return new ClientStatusMessage(message, 'ERROR', 'You need at least one voting option.')
        if(parameters.length > maxOptions+2) return new ClientStatusMessage(message, 'ERROR', 'The maximum number of voting choices is 8.')
        if(parameters.length >= 8) inLine = true
        
        const optionEmojis = {
            options: ['1️⃣','2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
            winner: '✅',
            loser: '❌',
            ballotBox: '🗳'
        }

        const filter = (reaction, user) => {
            return optionEmojis.options.includes(reaction.emoji.name);
        }

        const timeInput = parameters[1]
        let timeMs

        try {
            timeMs = toTime(timeInput.trim()).ms()
        } catch (error) {
            try {
                timeMs = Utilities.to_ms(timeInput)
            } catch (error) {
                return new ClientStatusMessage(message, 'ERROR', 'Time format invalid.')
            }
        }
        if(timeMs < 10000) return new ClientStatusMessage(message, 'CUSTOM', 'You should make the voting time longer than that ngl', 'Warning')
        const title = parameters[0]
        let totalVotes = []
        let totalOptions = 0
        let sentPoll

        let poll = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setTimestamp(Date.now())
            .setColor('#9c72f7')
            .setFooter(`The vote ends in ${Utilities.format(timeMs ?? defaultTime)}`)
            .setTitle(title)
        
        for(let i = 2; i < parameters.length; i++) {
            totalOptions++
            totalVotes.push(0)
            poll.addField(`${optionEmojis.options[i-2]} ${parameters[i]}`, totalVotes[i-2] + " votes", inLine)
        }

        message.channel.send(poll).then(async msg => {
            await message.delete()
            sentPoll = msg
            for(let i = 2; i < parameters.length; i++){
                await msg.react(optionEmojis.options[i-2])
            }
            let voters = []
            const collector = msg.createReactionCollector(filter, { time: timeMs ?? defaultTime })
            collector.on('collect', async (reaction, user) => {
                const userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(user.id))
                try {
                    for (const reaction of userReactions.values()) {
                        await reaction.users.remove(user.id)
                    }
                } catch (error) {
                    console.error('Failed to remove reactions.')
                }
                if(!voters.includes(user.id)) {
                    voters.push(user.id)
                } else {
                    return;
                }
                for(i = 0; i < totalOptions; i++) {
                    if(optionEmojis.options[i] == reaction.emoji.name) {
                        if(totalOptions < i+1) return
                        totalVotes[i]++
                    }
                }
            })
            collector.on('end', collected => {
                Utilities.log(`Poll closed in ${message.guild.name} - ${message.guild.id}`);
                const finishedPoll = new Discord.MessageEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setTimestamp(Date.now())
                    .setColor('#7bd477')
                    .setFooter(`The vote has ended!`)
                    .setTitle(title);
                let winningVote = 0
                let highestNumber = 0

                totalVotes.forEach((e, i) => {
                    if(e > highestNumber) {
                        highestNumber = e
                        winningVote = i
                    } 
                })

                for(let i = 2; i < parameters.length; i++) {
                    finishedPoll.addField(`${(i-2 == winningVote ? optionEmojis.winner : optionEmojis.options[i-2])} ${parameters[i]}`, totalVotes[i-2] + " vote" + (totalVotes[i-2] == 1 ? "" : "s"), inLine);
                }
                
                if(sentPoll) sentPoll.edit(finishedPoll)
                if(timeMs >= 1000 * 60 * 5) {
                    const notif = new Discord.MessageEmbed()
                    .setColor(COLOR_THEME)
                    .setTitle('Results are in :ballot_box:')
                    .setDescription(voters.map(e => `<@${e}>`).join(' ') + `\n[Jump to the poll results](${sentPoll.url})`)
                    message.channel.send(notif)
                }
            })
        })
    }
}