const { timeOptions } = require('../../config.json')
const toTime = require("to-time");
const chalk = require('chalk');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const clog = console.log;

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
    
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports = { Utilities }