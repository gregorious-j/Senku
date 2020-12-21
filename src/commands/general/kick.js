const { ClientStatusMessage } = require('../../util/status')

module.exports = {
    name: 'kick',
    description: 'Kick the specified user from the guild',
    usage: `kick @<member>`,
    permissionRequired: 2,
    args: false,
    category: 'general',
    execute(message, data) {
        let member = message.mentions.members.first();
        try {
            member.kick().then(member => {
                return new ClientStatusMessage(message, 'CUSTOM', `<@${member.user.id}> has been kicked.`, 'Kick', '#e3be36');
            });
        } catch(e) {
            console.error(e);
        }
    }
}