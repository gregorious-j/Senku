
const Discord = require("discord.js");
const toTime = require("to-time/src/ToTime");
const { COLOR_THEME } = require('../../config.json');
const { ClientStatusMessage } = require('../util/status');
const { Utilities } = require("../util/utilities");

class Poll {
    constructor(parameters, author, channel) {
        this.parameters = parameters;
        this.author = author;
        this.channel = channel;
        this.voters = [];
        this.totalVotes = [];
        this.totalOptions = 0;
        this.timeMs;
        this.title = parameters[0];
        this.maxOptions = 10;
        this.ui;
        this.botMsg;
        this.cancelled = false;
        this.emojis = {
            options: ['1️⃣','2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
            winner: '✅',
            loser: '❌',
            ballotBox: '🗳'
        }
        this.collector;
    }

    init() {
        const timeInput = this.parameters[1];
        try {
            this.timeMs = toTime(timeInput.trim()).ms();
        } catch (error) {
            try {
                this.timeMs = Utilities.to_ms(timeInput);
            } catch (error) {
                return this.channel.send(new ClientStatusMessage('ERROR', 'Time format invalid.').create());
            }
        }
        if(this.timeMs < 10000) return this.channel.send(new ClientStatusMessage('CUSTOM', 'You should make the voting time longer than that ngl', 'Warning').create());
       
        this.ui = new Discord.MessageEmbed()
            .setAuthor(this.author.username, this.author.avatarURL())
            .setTimestamp(Date.now())
            .setColor('#9c72f7')
            .setFooter(`The vote ends in ${Utilities.format(this.timeMs ?? 60000)}`)
            .setTitle(this.title);
        for(let i = 2; i < this.parameters.length; i++) {
            this.totalOptions++
            this.totalVotes.push(0)
            this.ui.addField(`${this.emojis.options[i-2]} ${this.parameters[i]}`, this.totalVotes[i-2] + " votes")
        }
        this.send();
    }

    async send() {
        this.channel.send(this.ui).then(async msg => {
            this.botMsg = msg;
            // Inititalize voting options
            for(let i = 2; i < this.parameters.length; i++){
                await this.botMsg.react(this.emojis.options[i-2])
            }
            // Vote collector
            this.collector = this.botMsg.createReactionCollector((reaction, user) => {
                this.emojis.options.includes(reaction.emoji.name);
            }, { time: this.timeMs ?? 60000 });
            this.collector.on('collect', async (reaction, user) => {
                const userReactions = this.botMsg.reactions.cache.filter(reaction => reaction.users.cache.has(user.id))
                try {
                    for (const reaction of userReactions.values()) {
                        await reaction.users.remove(user.id)
                    }
                } catch (error) {
                    console.error('Failed to remove reactions.')
                }
                let hasVoted = false;
                if(!this.voters.includes(user.id)) {
                    this.voters.push(user.id)
                } else {
                    hasVoted = true;
                }
                for(i = 0; i < this.totalOptions; i++) {
                    if(this.emojis.options[i] == reaction.emoji.name) {
                        if(this.totalOptions < i+1) return
                        this.totalVotes[i]++
                    }
                }
            })
            this.collector.on('end', collected => {
                this.finish();
            })
        })
    }

    finish() {
        // Calculate the winner and edit the message
        if(this.cancelled) return;
        const finishedPoll = new Discord.MessageEmbed()
            .setAuthor(this.author.username, this.author.avatarURL())
            .setTimestamp(Date.now())
            .setColor('#7bd477')
            .setFooter(`The vote has ended!`)
            .setTitle(this.title);
        let winningVote = 0;
        let highestNumber = 0;

        this.totalVotes.forEach((e, i) => {
            if(e > highestNumber) {
                highestNumber = e
                winningVote = i
            } 
        });

        for(let i = 2; i < this.parameters.length; i++) {
            finishedPoll.addField(`${(i-2 == winningVote ? this.emojis.winner : this.emojis.options[i-2])} ${this.parameters[i]}`, this.totalVotes[i-2] + " vote" + (this.totalVotes[i-2] == 1 ? "" : "s"));
        }
        
        if(this.botMsg) this.botMsg.edit(finishedPoll)
        if(this.timeMs >= 1000 * 60 * 5) {
            const notif = new Discord.MessageEmbed()
            .setColor(COLOR_THEME)
            .setTitle('Results are in :ballot_box:')
            .setDescription(this.voters.map(e => `<@${e}>`).join(' ') + `\n[Jump to the poll results](${this.botMsg.url})`)
            this.channel.send(notif)
        }
    }

    cancel() {
        const finishedPoll = new Discord.MessageEmbed()
            .setAuthor(this.author.username, this.author.avatarURL())
            .setTimestamp(Date.now())
            .setColor('#757575')
            .setFooter(`The poll was cancelled.`)
            .setTitle(this.title);
        this.cancelled = true;
        if(this.botMsg) this.botMsg.edit(finishedPoll)
        this.collector.stop();
    }

    getAuthorId() {
        return this.author.id;
    }
}


module.exports = { Poll };




