/*
==========================
====== Senku v0.0.9 ======
= Gregory Jackson © 2020 =
==========================
*/
const Discord = require("discord.js");
const {
  defaultPrefix,
  token,
  PORT,
  PASSWORD,
  COLOR_THEME,
  mongoURI
} = require("../config.json");
const LavaClient = require("lavaclient");
//const { MongoClient } = require("mongodb");
const { Utilities } = require("./util/utilities");
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true });
client.commands = new Discord.Collection();
const queues = new Map();
//const mdbclient = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
let leaveCooldown = null;

Utilities.getFiles("./commands").then((files) => {
  files.forEach((file) => {
    const command = require(file);
    client.commands.set(command.name, command);
  });
});

const nodes = [
  {
    id: "main",
    host: "localhost",
    port: PORT,
    password: PASSWORD,
  },
];

const manager = new LavaClient.Manager(nodes, {
  shards: 1,
  send(id, data) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(data);
    return;
  },
});

client.on("ready", async () => {
  manager.init(client.user.id);
  //await mdbclient.connect();
  client.user.setActivity(`?help`, { type: "WATCHING" });
  Utilities.log(`Senku is online`);
});

manager.on("socketError", ({ id }, error) =>
  console.error(`${id} ran into an error`, error)
);
manager.on("socketReady", (node) =>
  Utilities.log(`${node.id} connected to Lavalink`)
);

//Supply lavalink updates

client.ws.on("VOICE_STATE_UPDATE", (upd) => manager.stateUpdate(upd));
client.ws.on("VOICE_SERVER_UPDATE", (upd) => manager.serverUpdate(upd));

client.on("voiceStateUpdate", (oldMember, newMember) => {
  const queue = queues.get(oldMember.guild.id);
  if (!queue) return;
  const minUntilLeave = 2;
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;

  if (newUserChannel != null) {
    if (!leaveCooldown) return;
    clearTimeout(leaveCooldown);
  } else if (oldUserChannel != null) {
    let memberCount = 0;
    let lastMember;
    oldUserChannel.members.each((v) => {
      memberCount++;
      lastMember = v;
    });
    if (memberCount == 1 && lastMember.user.id == client.user.id) {
      Utilities.log(
        `Leaving ${oldMember.guild.name} in ${minUntilLeave} minutes`
      );
      leaveCooldown = setTimeout(() => {
        queue.stop();
        queues.delete(queue.message.guild.id);
        queue.message.channel.send(
          new Discord.MessageEmbed()
            .setDescription(
              `I've been alone for ${minUntilLeave} minutes :pensive:\n Guess I'll just leave...`
            )
            .setColor(COLOR_THEME)
            .setTimestamp(Date.now())
        );
      }, 1000 * 60 * minUntilLeave);
    }
  }
});

client.on("message", async (message) => {
  if (!message.guild) return;
  const settings = JSON.parse(fs.readFileSync('../guildsettings.json', 'utf8'));
  if(!settings[message.guild.id]) {
    settings[message.guild.id] = {
      prefix: defaultPrefix
    }
  }
  const prefix = settings[message.guild.id].prefix;

  if ((!message.content.startsWith(prefix)) ||
    message.content == prefix)
    return;

  const msg_args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = msg_args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );
    
  if(!allowCommandToExecute(message, command)) return;

  if (command.args && !msg_args.length) {
    return message.channel.send(
      `You didn't provide any arguments, ${message.author}! Use \`${prefix}help [command]\` to see the arguments for that command.`
    );
  }
  if (Utilities.getPermissionLevel(message.member) < command.permissionRequired)
    return message.reply(`You do not have permission to use this command!`);
  try {
    const data = {
      args: msg_args,
      queues: queues,
      manager: manager,
      //mongodb: mdbclient
    }
    command.execute(message, data);
  } catch (error) {
    console.error(error);
    message.reply(`there was an error trying to execute that command!`);
  }
});

let allowCommandToExecute = (message, command) => {
  if (!command) return false;
  if (command.disabled) return false;
  if (Utilities.isCommandLocked(message, command.name)) {
    message.reply('this command needs to be unlocked by a server admin')
    return false;
  };
  return true;
} 

client.login(token);
