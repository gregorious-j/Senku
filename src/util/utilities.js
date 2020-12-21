const { timeOptions, owners, defaultPrefix } = require('../../config.json')
const toTime = require("to-time");
const chalk = require('chalk');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const clog = console.log;
const fs = require('fs');
class Utilities {

    static log(message) {
        clog(`${chalk.blueBright(this.getTime() + ': ')}${message}`);
    }

    static async getFiles(dir) {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return files.flat().map(file => file.replace(/\\/g, '/'));
    }

    static getFlag(args) {
        return args.join(' ').match(/--[a-z0-9:]+/g)[0].split('--')[0];
    }

    static getTime() {
        return new Date().toLocaleTimeString("en-US", timeOptions);
    }

    static format(d) {
        try {
            let result = new Date(d).toISOString().substr(11, 8).replace(/^[0:]+/, "");
            if (result == '') {
                result = '0:00'
            }
            if (!result.includes(':')) {
                if (parseInt(result) < 10) {
                    result = '0:0' + result;
                } else {
                    result = '0:' + result;
                }
            }
            return result;
        } catch (error) {
            this.log(error);
        }
    }

    static to_ms(timeString) {
        try {
            if (timeString == '0s' || timeString == '0:00' || timeString == '0') {
                let ms = 1;
                return ms;
            } else {
                let ms = toTime(timeString).ms()
                return ms;
            }
        } catch (e) {
            try {
                if (!/[0-9]+:[0-9]+/.test(timeString)) return null
                const nums = timeString.split(':').reverse();
                let ms = 0;
                for (let i = 0; i < nums.length; i++) {
                    const parsedNum = parseInt(nums[i]);
                    if (i < 3) {
                        ms += (Math.pow(60, i)) * parsedNum * 1000;
                    } else if (i == 3) {
                        ms += parsedNum * 24 * 60 * 60 * 1000;
                    } else {
                        return null
                    }
                }
                return ms;
            } catch (e) {
                console.error(e);
            }
        }
    }

    static getPermissionLevel(member) {
        if (owners[0] == member.user.id) return 5;
        if (owners.includes(member.user.id)) return 4;
        if (member.guild.ownerID == member.id) return 3;
        if (member.hasPermission("MANAGE_GUILD")) return 2;
        if (member.hasPermission("MANAGE_MESSAGES")) return 1;
        return 0;
    }

    static isCommandLocked(message, commandName) {
        const settings = JSON.parse(fs.readFileSync('../guildsettings.json', 'utf8'));
        const id = message.guild.id;
        if(!settings[id]) {
            settings[id] = {
                prefix: defaultPrefix,
                lockedCommands: this.getDefaultLockedCommands(message.client)
            } 
            this.writeToSettings(settings);
        } else if(!settings[id].lockedCommands) {
            settings[id]["lockedCommands"] = this.getDefaultLockedCommands(message.client);
            this.writeToSettings(settings);
        }
        return settings[id].lockedCommands.includes(commandName);
    }

    static writeToSettings(obj) {
        fs.writeFile(process.cwd().replace(/\\/g, '/') + "/../guildsettings.json", JSON.stringify(obj), err => {
            if(err) {
                console.log(err)
                return new ClientStatusMessage(message, 'ERROR', 'Error writing to file');
            }
        })
    }

    static getDefaultLockedCommands(client) {
        const { commands } = client;
        let lockedCommands = [];
        commands.forEach(c => {
            if(c.default) {
                if(c.default.lock) lockedCommands.push(c.name);
            }
        })
        return lockedCommands;
    }

    static getGuildSettings(id) {
        const settings = JSON.parse(fs.readFileSync('../guildsettings.json', 'utf8'));
        return settings[id];
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports = { Utilities }