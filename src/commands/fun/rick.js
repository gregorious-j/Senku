const { SPECIAL_GUILDS } = require('../../../config.json');
const { Utilities } = require('../../util/utilities');
const Discord = require('discord.js');

// this is horrible
const pickles = [
    "./assets/ricks/picklerick.png", // 2pts[0]
    "./assets/ricks/Rick-and-Morty-Pickle-Rick-Inflatable-Chair.jpg", // 10pts [1]
    "./assets/ricks/rickmug.jpg", // -1pts [2]
    "./assets/ricks/rickplush.jpg", // 2pt [3]
    "./assets/ricks/rickpanties.jpg", // 5pts [4]
    "./assets/ricks/ricksocks.jpg", // -3pts [5]
    "./assets/ricks/rickheadphones.jpg", // 2pts [6]
    "./assets/ricks/rickshower.jpg",  // Worth 50 Pts, [7]
    "./assets/ricks/phonecase.jpg", // 2 pts [8]
    "./assets/ricks/pop.jpg", // 2 pts [9]
    "./assets/ricks/rickbackpack.jpg", // 3pts [10]
    "./assets/ricks/rickhat.jpg", // 3pts[11]
    "./assets/ricks/rickshirt.jpg", //2pts [12]
    "./assets/ricks/slippers.jpg",// -1pt [13]
    "./assets/ricks/airpod.jpg", // 2pts [14]
    "./assets/ricks/tikicup.jpg",
    "./assets/ricks/towel.jpg",
    "./assets/ricks/rick_curtain.jpg",
    "./assets/ricks/pickledick.jpg",
    "./assets/ricks/rickcondom.jpg",
    "./assets/ricks/moneyclip.jpg",
    "./assets/ricks/waterbottle.jpg",
    "./assets/ricks/ricksocks2.jpg"
]

module.exports = {
    name: 'rick',
    guildLock: SPECIAL_GUILDS,
    description: `Funniest shit I've ever seen`,
    usage: `rick`,
    permissionRequired: 0,
    args: false,
    category: 'fun',
    execute(message, args, queues, manager) {
        let whichRick = Utilities.getRandomInt(0, pickles.length);
        message.channel.send("here is funny pickle ric k", {
        files: [{
          attachment: pickles[whichRick]
        }]
      })
    }
}