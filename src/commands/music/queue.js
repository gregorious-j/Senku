const { QueueWidget } = require('../../queue/queueWidget');
const { prefix, COLOR_THEME } = require('../../../config.json');
const Discord = require("discord.js");

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'Displays the current queue.',
    usage: `\`queue\``,
    permissionRequired: 0,
    args: false,
    category: 'music',
    execute(message, args, queues) {
        const queue = queues.get(message.guild.id);
        
        if(!queue || queue.tracks.length == 0) {
            embed = new Discord.MessageEmbed()
            .setTitle('There is no queue :sob:')
            .setFooter('Use the play command to start a queue')
            .setColor(COLOR_THEME);
            message.channel.send(embed);
        } else {
            queue.createWidget();
        }
            
        
        
    }
}