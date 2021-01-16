
const Discord = require("discord.js");
const toTime = require("to-time/src/ToTime");
const { COLOR_THEME } = require('../../../config.json');
const { Poll } = require("../../util/pollObj");
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
    async execute(message, {args, polls}) {
        const guildPolls = polls?.get(message.guild.id);
        const userPoll = guildPolls?.get(message.author.id);
        if(args == 'cancel') {
            if(userPoll) {
                userPoll.cancel();
                guildPolls.delete(message.author.id);
            } else {
                return message.channel.send(new ClientStatusMessage('ERROR', 'You don\'t have an active poll.').create());
            }
        } else if(args == 'end') {
            if(userPoll) {
                userPoll.finish();
                guildPolls.delete(message.author.id);
            } else {
                return message.channel.send(new ClientStatusMessage('ERROR', 'You don\'t have an active poll.').create());
            }
        } else {
            const parameters = args.join(' ').split(',');
            const maxOptions = 10;
            let inLine = false;
            if(parameters.length <= 3) return message.channel.send(new ClientStatusMessage('ERROR', 'Cannot create poll with 1 option').create());
            if(!parameters[2] || parameters.includes('')) return message.channel.send(new ClientStatusMessage('ERROR', 'You need at least one voting option.').create());
            if(parameters.length > maxOptions+2) return message.channel.send(new ClientStatusMessage('ERROR', 'The maximum number of voting choices is 10.').create());
            if(parameters.length >= 8) inLine = true;
            const newPoll = new Poll(parameters, message.author, message.channel);
            if(!guildPolls) {
                const map = new Map([[message.author.id, newPoll]]);
                polls.set(message.guild.id, map);
            } else if(!userPoll) {
                guildPolls.set(message.author.id, newPoll)
            } else {
                return message.channel.send(new ClientStatusMessage('ERROR', 'You already have an active poll.').create());
            }
            newPoll.init();
        }
    }
}