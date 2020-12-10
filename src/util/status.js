const { COLOR_THEME } = require('../../config.json');
const Discord = require('discord.js');

class ClientStatusMessage {
    constructor(message, type = 'ERROR', reason = `uhhh <@130317861183946753> wtf`, title, color = COLOR_THEME) {
        this.message = message;
        this.reason = reason;
        this.type = type;
        this.title = title;
        this.color = color;
        this.send();
    }
    send() {
        const embed = new Discord.MessageEmbed().setTimestamp(Date.now()).setColor(COLOR_THEME);
        if(this.type == 'ERROR') {
            embed.setColor('#ff0000');
            embed.setTitle('Error');
        } else if (this.type == 'WARNING'){
            embed.setColor('#ffae00');
            embed.setTitle('Warning');
        } else if (this.type == 'INFO') {
            embed.setTitle('Info');
        } else if (this.type == 'CUSTOM') {
            embed.setColor(this.color);
            embed.setTitle(this.title);
        }
        embed.setDescription(this.reason);
        return this.message.channel.send(embed);
    }
}
module.exports = { ClientStatusMessage };