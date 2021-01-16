const Discord = require('discord.js')
const fs = require('fs')
const { ClientStatusMessage } = require('../../util/status')
const { Utilities } = require('../../util/utilities')

module.exports = {
    name: 'prefix',
    description: 'Change Senku\'s command prefix. If no new prefix is provided, the prefix will be reset to the default (\`?\`)',
    usage: `prefix <new prefix>`,
    permissionRequired: 2,
    args: true,
    category: 'general',
    execute(message, data) {
        const settings = Utilities.getGuildSettings(message);
        settings.prefix = data.args.join(' ');
        const globalSettings = require('../../../guildsettings.json');
        globalSettings[message.guild.id] = settings;
        fs.writeFile(process.cwd().replace(/\\/g, '/') + "/../guildsettings.json", JSON.stringify(globalSettings), err => {
            if(err) {
                console.log(err)
                return message.channel.send(new ClientStatusMessage('ERROR', 'Error writing to file').create());
            }
        })
        return message.channel.send(new ClientStatusMessage('CUSTOM', `Successfully changed the prefix to \`\`\`${settings.prefix}\`\`\``, 'Prefix changed').create())   
    }
}