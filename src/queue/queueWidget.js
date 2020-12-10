const Discord = require("discord.js");
const { COLOR_THEME } = require("../../config.json");
const { Utilities } = require("../util/utilities");
const chalk = require("chalk")

class QueueWidget {
    constructor(message, queue) {
        this.msg = message;
        this.queue = queue;
        this.player = queue.getPlayer();
        this.queueList = queue.getCurrentQueue();
        this.head = queue.head;
        this.repeat = queue.repeat;
        this.emojis = {
            pagePrev: "⬅️",
            pageNext: "➡️",
            skip: "⏭️",
            back: "⏮️",
            shuffle: "🔀"
        };
        this.pages;
        this.numPages;
        this.currentPage = 0;
        this.playingOnPage;
        this.active = false;
        this.timeActive = 60000;
        this.sentMessage;
        this.filter = (reaction, user) => {
            return (
                (reaction.emoji.name === this.emojis.pagePrev ||
                    reaction.emoji.name === this.emojis.pageNext ||
                    reaction.emoji.name === this.emojis.shuffle) &&
                user.id === this.msg.author.id
            );
        }
    }


    async generateList() {
        
        this.numPages = Math.ceil((this.queueList.length) / 10);
        this.pages = [];
        this.songIndex = 0;
        let numSongs = this.queueList.length;

        for (let i = 0; i < this.numPages; i++) {
            let pageText = '';
            let count = 1;
            for (let j = this.songIndex; j < numSongs; j++) {
                if (count == 11) continue;
                if (this.queueList[j].playing) {
                    this.currentPage = i;
                    pageText += `[\`${j + 1}:\` ${this.queueList[j].title}](${this.queueList[j].uri}) <@${this.queueList[j].requestedBy.id}>\n  \`${Utilities.format(this.player.position)} / ${this.queueList[j].isStream ? 'Live 🔴' : Utilities.format(this.queueList[j].lengthMs)}\`\n`;
                } else {
                    pageText += `\`${j + 1}:\` ${this.queueList[j].title} \`${this.queueList[j].startTime == 0 ? `` : `${Utilities.format(this.queueList[j].startTime)} / `}${this.queueList[j].isStream ? 'Live 🔴' : Utilities.format(this.queueList[j].lengthMs)}\`` + ` \n`;
                }
                if (this.queue.atEnd) {
                    this.currentPage = i;
                }   
                this.songIndex++;
                count++;
            }
            this.pages[i] = `${pageText}${this.repeat ? '\nThe current track is on repeat 🔁' : ''}\nVolume: \`${this.queue.volume}%\`\n**${i+1 == 1 ? ``: `🡐`} Page ${i + 1}/${this.numPages} ${i+1 == this.numPages ? `` : `🡒`}**`;
        }
        
    }

    async create() {

        await this.generateList();
        this.active = true;
        this.embed = new Discord.MessageEmbed()
            .setTitle(`Queue`)
            .setColor(COLOR_THEME)
            .setDescription(this.pages[this.currentPage]);

        return this.msg.channel.send(this.embed).then(async msg => {
            this.sentMessage = msg;
            console.log(`${chalk.blueBright(Utilities.getTime() + ':')} Queue opened in ${chalk.greenBright(this.msg.guild.name)} - ${this.msg.guild.id}`);
            if (this.numPages > 1) {
                await msg.react(this.emojis.pagePrev);
                await msg.react(this.emojis.pageNext);
            }
            await msg.react(this.emojis.shuffle);

            const collector = msg.createReactionCollector(this.filter, { time: this.timeActive })
            collector.on('collect', async (reaction, user) => {
                
                const userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(this.msg.author.id));
                try {
                    for (const reaction of userReactions.values()) {
                        await reaction.users.remove(this.msg.author.id);
                    }
                } catch (error) {
                    console.error('Failed to remove reactions.');
                }

                const newEmbed = new Discord.MessageEmbed()
                    .setTitle(`Queue`)
                    .setColor(COLOR_THEME)
                switch (reaction.emoji.name) {
                    case this.emojis.pagePrev: {
                        if (this.currentPage == 0) break;
                        if (this.numPages < 1) break;
                        this.currentPage--;
                        newEmbed.setDescription(this.pages[this.currentPage]);
                        msg.edit(newEmbed);
                        break;
                    }
                    case this.emojis.pageNext: {
                        if (this.currentPage == this.pages.length - 1) break;
                        if (this.numPages < 1) break;
                        this.currentPage++;
                        newEmbed.setDescription(this.pages[this.currentPage]);
                        msg.edit(newEmbed);
                        break;
                    }
                    case this.emojis.shuffle: {
                        this.queue.shuffle();
                        await this.generateList();
                        newEmbed.setDescription(this.pages[this.currentPage]);
                        msg.edit(newEmbed);
                        break;
                    }

                }
            

            })
            collector.on('end', collected => {
                this.active = false;
                this.queue.deleteWidget();
                console.log(`${chalk.blueBright(Utilities.getTime() + ':')} Queue collection closed in ${chalk.greenBright(this.msg.guild.name)} - ${this.msg.guild.id}`);
            })

        })
    }

    isActive() {
        return this.active;
    }

    async update() {
        if(this.active) {
                const newEmbed = new Discord.MessageEmbed()
                .setTitle(`Queue`)
                .setColor(COLOR_THEME)
            await this.generateList();
            newEmbed.setDescription(this.pages[this.currentPage]);
            this.sentMessage.edit(newEmbed);
        }
    }
}

module.exports = { QueueWidget };