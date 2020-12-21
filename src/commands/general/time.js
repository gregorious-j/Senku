const { prefix } = require('../../../config.json')
const { Utilities } = require('../../util/utilities')

module.exports = {
    name: 'time',
    description: 'Displays the current time.',
    usage: `\`${prefix}time\``,
    permissionRequired: 0,
    args: false,
    category: 'general',
    execute(message, data) {
        message.channel.send('It\'s ' + Utilities.getTime() + '.')
    }
}