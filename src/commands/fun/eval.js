const { prefix, COLOR_THEME } = require('../../../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'eval',
    aliases: ['evaluate'],
    description: `Execute some JS code using Senku. No, it isn't safe`,
    usage: `\`${prefix}eval <js expression>\``,
    permissionRequired: 4,
    args: true,
    category: 'fun',
    execute(message, args, queues, manager) {
        const script = args.join(' ');
        message.channel.send(new Discord.MessageEmbed().setDescription('Running...')).then(msg => {
            try {
                const begin = process.hrtime();
                const result = eval(script);
                const diff = process.hrtime(begin);
                msg.edit(new Discord.MessageEmbed()
                .setTitle('Success ✅')
                .addField('Profiler', `Finished in \`${((diff[0] * 1e9 + diff[1]) * 1e-6).toFixed(3)}ms\``)
                .addField('Result', `\`\`\`js\n${result}\`\`\``)
                .setColor(COLOR_THEME)
                .setTimestamp(Date.now())
                )
            } catch (error) {
                msg.edit(new Discord.MessageEmbed()
                .setTitle('Error ❌')
                .addField('Details', `\`\`\`js\n${error}\`\`\``)
                .setColor('#ff0044')
                .setTimestamp(Date.now())
                )
            }
        });
    }
}