const Discord = require('discord.js');

const fs = require('fs');
const { ClientStatusMessage } = require('../../util/status');
module.exports = {
    name: 'prefix',
    description: 'Change Senku\'s command prefix. If no new prefix is provided, the prefix will be reset to the default (\`?\`)',
    usage: `prefix <new prefix>`,
    permissionRequired: 0,
    args: false,
    category: 'general',
    execute(message, args, queues, manager) {
        const prefixes = JSON.parse(fs.readFileSync(process.cwd().replace(/\\/g, '/') + "/../guildsettings.json", 'utf8'));
        if(!args[0]) {
            if(!prefixes[message.guild.id]) {
                prefixes[message.guild.id] = {
                    prefix: defaultPrefix
                }
            }
            return new ClientStatusMessage(message, 'CUSTOM', `The current prefix is \`${prefixes[message.guild.id].prefix}\``, 'Prefix')
        }
        prefixes[message.guild.id] = {
            prefix: args.join(' ')
        }
        fs.writeFile(process.cwd().replace(/\\/g, '/') + "/../guildsettings.json", JSON.stringify(prefixes), err => {
            if(err) {
                console.log(err);
                return new ClientStatusMessage(message, 'ERROR', 'Error writing to file');
            }
            console.log(JSON.stringify(prefixes));
        })
        return new ClientStatusMessage(message, 'CUSTOM', `Successfully changed the prefix to \`\`\`${prefixes[message.guild.id].prefix}\`\`\``, 'Prefix changed')
        
        
        
        
    }
};