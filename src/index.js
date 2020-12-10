const Discord = require("discord.js");
const {
  defaultPrefix,
  token,
  owners,
  PORT,
  PASSWORD,
  COLOR_THEME,
} = require("../config.json");
const LavaClient = require("lavaclient");
const { Utilities } = require("./util/utilities");
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true });
client.commands = new Discord.Collection();
const queues = new Map();
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
  await manager.init(client.user.id);
  
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

  if ((!message.content.startsWith(prefix || "<@709209347619684452>")) ||
    message.content == prefix)
    return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if(allowCommandToExecute()) return;

  if (command.args && !args.length) {
    return message.channel.send(
      `You didn't provide any arguments, ${message.author}! Use \`${prefix}help [command]\` to see the arguments for that command.`
    );
  }

  if (getPermissionLevel(message.member) < command.permissionRequired)
    return message.reply(`You do not have permission to use this command!`);

  try {
    command.execute(message, args, queues, manager);
  } catch (error) {
    console.error(error);
    message.reply(`there was an error trying to execute that command!`);
  }
});

let getPrefix = (guildId) => {
  const prefixes = JSON.parse(fs.readFileSync('../prefixes.json', 'utf8'));
  if(!prefixes[guildId]) {
    prefixes[guildId] = {
      prefix: defaultPrefix
    }
  }
  return prefixes[guildId].prefix
}

let getPermissionLevel = (member) => {
  if (owners[0] == member.user.id) return 5;
  if (owners.includes(member.user.id)) return 4;
  if (member.guild.ownerID == member.id) return 3;
  if (member.hasPermission("MANAGE_GUILD")) return 2;
  if (member.hasPermission("MANAGE_MESSAGES")) return 1;
  return 0;
};

let allowCommandToExecute = (message, command) => {
  if (!command) return false;
  if (command.disabled) return false;
  if (command.guildLock) {
    if(!command.guildLock.includes(message.guild.id)) return false;
  }
} 

client.login(token);
