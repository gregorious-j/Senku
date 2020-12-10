const { SPECIAL_GUILDS } = require('../../../config.json');
const { Utilities } = require('../../util/utilities');
const Discord = require('discord.js');
const pickles = [
    "./assets/images/picklerick.png", // 2pts[0]
    "./assets/images/Rick-and-Morty-Pickle-Rick-Inflatable-Chair.jpg", // 10pts [1]
    "./assets/images/rickmug.jpg", // -1pts [2]
    "./assets/images/rickplush.jpg", // 2pt [3]
    "./assets/images/rickpanties.jpg", // 5pts [4]
    "./assets/images/ricksocks.jpg", // -3pts [5]
    "./assets/images/rickheadphones.jpg", // 2pts [6]
    "./assets/images/rickshower.jpg",  // Worth 50 Pts, [7]
    "./assets/images/phonecase.jpg", // 2 pts [8]
    "./assets/images/pop.jpg", // 2 pts [9]
    "./assets/images/rickbackpack.jpg", // 3pts [10]
    "./assets/images/rickhat.jpg", // 3pts[11]
    "./assets/images/rickshirt.jpg", //2pts [12]
    "./assets/images/slippers.jpg",// -1pt [13]
    "./assets/images/airpod.jpg", // 2pts [14]
    "./assets/images/tikicup.jpg",
    "./assets/images/towel.jpg",
    "./assets/images/rick_curtain.jpg",
    "./assets/images/pickledick.jpg",
    "./assets/images/rickcondom.jpg",
    "./assets/images/moneyclip.jpg",
    "./assets/images/waterbottle.jpg",
    "./assets/images/ricksocks2.jpg"
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