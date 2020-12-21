const Discord = require("discord.js")
const toTime = require("to-time")
const isUrl = require("is-url")
const chalk = require('chalk')
const { ClientStatusMessage } = require("../util/status")
const { Utilities } = require("../util/utilities")
const { Track } = require("./track")
const { QueueWidget } = require("./queueWidget")
const { COLOR_THEME } = require("../../config.json")

class Queue {

    constructor(voiceChannel, message, manager) {
        this.voiceChannel = voiceChannel
        this.lavaplayer
        this.volume = 50
        this.tracks = []
        this.head = 0
        this.isPlaying = false
        this.repeat = false
        this.atEnd = false
        this.message = message
        this.manager = manager
        this.widget = null
    }

    async join(selfDeaf) {
        if (!this.lavaplayer) this.lavaplayer = await this.manager.create(this.message.guild.id)
        if (!this.lavaplayer.connected) await this.lavaplayer.connect(this.voiceChannel.id, { selfDeaf: selfDeaf })
    }

    add(args, message) {
        return new Promise(async (success, reject) => {
            Utilities.log(`Attempting to lookup and add track(s) to the queue...`)
            let humanTime = '0s'
            let timeOffset
            let shuffle = false
            let results
            this.args = args.join(' ')
            try {
                timeOffset = toTime(humanTime).ms()
            } catch (e) {
                reject();
                return new ClientStatusMessage(message, 'ERROR', `The start time was not given in a supported format. Use \`?help play\` for more information.`)
            }
            const playlistPattern = /^.*(list=|sets|album)([^#\&\?\/]*).*/gi;
            if (playlistPattern.test(this.args)) {
                this.addPlaylist(shuffle).then(resolve => {
                    success(this);
                })
            } else {
                try {
                    let query = (isUrl(this.args) ? "" : "ytsearch:") + this.args;
                    results = await this.lavaplayer.manager.search(query);
                } catch (error) {
                    return console.error(error);
                }
                if (!results.tracks[0]) {
                    Utilities.log('No Matches');
                    reject();
                } else {
                    Utilities.log(`Found song`);
                }
                const { track, info } = results.tracks[0];
                this.tracks = [...this.tracks, new Track(track, info, timeOffset, message.author)]
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Added Track`)
                    .setColor(COLOR_THEME)
                if (info.isStream) {
                    embed.setDescription(`\`${this.tracks.length}:\` [${info.title}](${info.uri})\n\`Live 🔴\`\n<@${message.author.id}>`)
                } else {
                    embed.setDescription(`\`${this.tracks.length}:\` [${info.title}](${info.uri})\n\`${Utilities.format(timeOffset)} / ${Utilities.format(info.length)}\`\n<@${message.author.id}>`)
                }
                Utilities.log(`Finished adding track to the queue`);
                this.message.channel.send(embed);
                success(this);
            }
        });
    }

    async addPlaylist(shuffle) {
        return new Promise(async (success, reject) => {
            const ytPattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
            let results;
            if (ytPattern.test(this.args)) {
                const playlistCode = this.args.split('list=')[1];
                results = await this.lavaplayer.manager.search('https://www.youtube.com/playlist?list=' + playlistCode);
            } else {
                results = await this.lavaplayer.manager.search(this.args)
            }

            const { tracks, playlistInfo } = results;
            if(!results) reject();
            if (tracks) {
                tracks.forEach((e, i) => {
                    this.tracks.push(new Track(e.track, e.info, 0, this.message.author, playlistInfo));
                });

                Utilities.log(`Added ${tracks.length} tracks to ${this.message.guild.name} [${this.message.guild.id}]`)
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Added ${shuffle ? 'Shuffled' : ''} Playlist`)
                    .setColor(COLOR_THEME)
                    .setDescription(`[${playlistInfo.name}](${this.args}) — \`${tracks.length}\` track playlist`)
                this.message.channel.send(embed);
                Utilities.log(`Finished adding tracks to the queue`);
                
                if (shuffle) this.shuffle();

                success();
            }
        });
    }                       

    async beginPlayback() {
        // Set the first track's status to playing = true
        this.tracks[0].isPlaying(true);
        try {
            this.lavaplayer.setVolume(this.volume);
            if (this.tracks[0].isStream) {
                this.tracks[0].startTime = null;
            } else {

                // Tell Lavaplayer to play the first track

                await this.lavaplayer.play(this.tracks[0].track, { startTime: this.tracks[0].startTime });

                // Adding event listeners to the player
                // These will be called when a song errors or ends

                this.lavaplayer
                    .on("error", (e) => {
                        Utilities.log(`${e.type}: ${e.error} for track ${e.track}`);
                    })
                    .on("end", async data => {
                        if (data.reason === "REPLACED") return;
                        if (!this.repeat) {
                            this.skip('next', false);
                        } else {
                            await this.lavaplayer.play(this.tracks[this.head].track, { startTime: this.tracks[this.head].startTimeMs });
                        }
                    });
                Utilities.log(`Playing ${this.tracks[0].title} in ${chalk.greenBright(this.message.guild.name)} [${this.message.guild.id}]`);
            }
        } catch (error) {
            Utilities.log(error);
            return new ClientStatusMessage(this.message, 'ERROR', 'Unable to start playback');
        }
    }


    async play(track, showNP) {
        try {
            track.isPlaying(true)
            await this.lavaplayer.play(track.track, { startTime: track.startTimeMs });
            if (showNP) this.displayNowPlaying(track.startTime);
            Utilities.log(`Playing ${track.title} in ${chalk.greenBright(this.message.guild.name)} [${this.message.guild.id}]`);
        } catch (e) {
            console.error(e)
        }

    }

    stop() {
        if (!this.voiceChannel) {
            return new ClientStatusMessage(message, 'ERROR', `<@${message.member.id}>, You can't play something without joining a voice channel.`)
        }
        this.lavaplayer.disconnect(true)
        this.atEnd = false
        this.lavaplayer.stop().then(() => {
            this.repeat = false;
            this.tracks = [];
            this.widget = null;
            Utilities.log(`Stopping player in ${chalk.greenBright(this.message.guild.name)} [${this.message.guild.id}]`);
        });
    }

    skip(pos, showNP) {
        if (pos == 'next') {
            if (this.head + 1 < this.tracks.length) {
                this.tracks[this.head].isPlaying(false);
                this.head++;
                this.play(this.tracks[this.head], this.widget ? false : showNP);
            } 
        } else {
            if (pos + 1 > this.tracks.length || pos < 0) return new ClientStatusMessage(this.message, 'ERROR', 'Cannot skip to that track.');
            this.tracks[this.head].isPlaying(false);
            this.head = pos;
            const track = this.tracks[this.head];
            this.play(track, this.widget ? false : showNP);
        }
        if(this.widget) this.widget.update();
    }

    back(showNP) {
        if (!this.atEnd) {
            this.head--;
            const track = this.tracks[this.head];
            this.play(track, this.widget ? false : showNP);
        } else {
            const track = this.tracks[this.head];
            this.play(track, this.widget ? false : showNP);
            this.atEnd = false;
        }
        if(this.widget) this.widget.update();
    }

    pause() {
        if (!this.lavaplayer.paused) this.lavaplayer.pause();
    }


    async resume() {
        this.lavaplayer.resume();
    }


    setVolume(vol = 100) {
        if (vol > 100 || vol < 1) return new ClientStatusMessage(this.message, 'ERROR', 'Volume out of bounds. A valid volume is between 1 and 100.');
        this.lavaplayer.setVolume(vol).then(() => {
            this.volume = vol;
            Utilities.log(`Changing volume in ${this.message.guild.id}`);
            this.message.channel.send(`Set volume to \`${vol}%\``);
            if(this.widget) this.widget.update();
        });
    }

    seek(time) {
        const track = this.tracks[this.head];
        if (this.atEnd) return new ClientStatusMessage(this.message, 'ERROR', 'No track playing');
        if (!track.info.isSeekable) return new ClientStatusMessage(this.message, 'ERROR', 'Track is not seekable');
        let time_ms;
        time_ms = Utilities.to_ms(time);

        if (!time_ms) return new ClientStatusMessage(this.message, 'ERROR', 'Format not supported');

        if (time_ms > track.lengthMs || time_ms < 0) return new ClientStatusMessage(this.message, 'ERROR', `Seek out of bounds`);

        if (time_ms == 0) {
            return this.play(track, true);
        } else {
            this.lavaplayer.seek(time_ms).then(success => {
                Utilities.log(`Seeking player to ${chalk.yellow(time_ms + 'ms')} in ${chalk.greenBright(this.message.guild.name)} [${this.message.guild.id}]`);
                this.displayNowPlaying(time_ms);
            }, fail => {
                Utilities.log(`Failed to seek player in ${chalk.greenBright(this.message.guild.name)} [${this.message.guild.id}]`);
            })
        }
    }

    displayNowPlaying(forcedTime = 'none') {

        const track = this.tracks[this.head];
        const trackLength = track.lengthMs;
        const barLength = 26;
        const currentTime = forcedTime == 'none' ? this.lavaplayer.position : forcedTime;

        const embed = new Discord.MessageEmbed()
            .setColor(COLOR_THEME)
            .setTitle(`Now Playing`);
        // Check for live stream
        if (track.isStream) {
            embed.setDescription(`\`${this.head + 1}:\` [${track.title}](${track.uri})${track.playlistData ? `\nin **${track.playlistData.name}**` : ``} 
                \`Live 🔴\`\n${this.repeat ? "🔁 - Repeat on" : ""}`)
        } else {
            embed.setDescription(`\`${this.head + 1}:\` [${track.title}](${track.uri})${track.playlistData ? `\nin **${track.playlistData.name}**` : ``} 
                \`${Utilities.format(currentTime)}\`${this.progressBar(barLength, trackLength, currentTime)}\`${Utilities.format(trackLength)}\`\n${this.repeat ? "🔁 - Repeat on" : ""}`)
        }
        this.message.channel.send(embed)
    }

    toggleRepeat() {
        this.repeat ? this.repeat = false : this.repeat = true
        if(this.widget) this.widget.update()
    }

    shuffle() {    
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
        this.tracks.forEach(t => {
            t.isPlaying(false);
        });
        this.skip(this.head, false);
        if(this.widget) this.widget.update();
    }

    removeTracks(args) {
        return new Promise((resolve, reject) => {
            let tracksRemoved = '';
            let trackNums = [];
            let tracks = args.join(' ').split(',');
            if (tracks.length > 50) return new ClientStatus(this.message, 'ERROR', 'Too many tracks to remove!');
            tracks.forEach((e, i) => {
                trackNums.push(parseInt(e));
            })
            trackNums.sort();
            try {
                for (let i = trackNums.length - 1; i >= 0; i--) {
                    if (this.head === trackNums[i]) return reject('Head conflict');
                    if (this.tracks[trackNums[i] - 1]) {
                        tracksRemoved += `\`${trackNums[i]}: ${this.tracks[trackNums[i] - 1].title}\`${(trackNums.length > 1 && i > 0 ? ', ' : '')}\n`;
                        this.tracks.splice(trackNums[i] - 1, 1);
                    }

                }
                if(this.widget) this.widget.update();
                resolve(tracksRemoved);
            } catch (error) {
                console.error(e);
                reject('Could not remove some tracks.');
            }

        })
    }

    createWidget() {
        this.widget = new QueueWidget(this.message, this);
        this.widget.create();
    }

    deleteWidget() {
        this.widget = null;
    }

    getVoiceChannel() {
        return this.voiceChannel;
    }

    getCurrentQueue() {
        return this.tracks;
    }

    getHead() {
        return this.head;
    }

    getPlayer() {
        return this.lavaplayer;
    }

    setHead(pos) {
        this.head = pos;
    }

    progressBar(barLength, trackLength, time) {
        const delta = Math.round((time / trackLength) * barLength);
        let bar = '';
        for (let i = 0; i <= barLength; i++) {
            if (i == 0 && delta != 0) bar += '⎹';
            if (i == delta) {
                bar += '⬤';
            } else if (i == barLength && delta != barLength) {
                bar += '⎸';
            } else {
                bar += '═';
            }
        }
        return bar;
    }
}


module.exports = { Queue }