// const Discord = require("discord.js");
// const toTime = require("to-time/src/ToTime");
// const { COLOR_THEME } = require('../../../config.json');
// const { Poll } = require("../../util/pollObj");
// const { ClientStatusMessage } = require('../../util/status');
// const { Utilities } = require("../../util/utilities");
// const poll = require("./poll");

// module.exports = {
//     name: 'cancel',
//     aliases: [],
//     description: `Cancel a poll.`,
//     usage: `cancel <id>`,
//     permissionRequired: 0,
//     cooldown: 60,
//     args: true,
//     category: 'fun',
//     async execute(message, {args, polls}) {
//         const id = parseInt(args[0]);
//         if(!polls.get(message.author.id)) return message.channel.send(new ClientStatusMessage('ERROR', `You do not have any active polls`).create()); 
//         let index = -1;
//         console.log(polls.get(message.author.id))
//         for(i = 0; i < polls.get(message.author.id).length; i++) {
//             let poll = polls.get(message.author.id)[i];
//             if(id == poll.getId()) {
//                 poll.cancel();
//                 index = i;
//                 polls.get(message.author.id).splice(i);
//             }
//         }
//         if(index < 0) {
//             message.channel.send(new ClientStatusMessage('ERROR', `You do not own poll with \`id#${id}\``).create());
//         }
//         if(polls.get(message.author.id) == [])
//             polls.delete(message.author.id);
//     }
// }