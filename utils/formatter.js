const moment = require('moment');

function formatMessage(username, email, date, message) {
    return {
        username,
        email,
        message,
        time: (moment(date).format('DD.MM.YYYY - HH:mm') + (' Uhr'))
    };
}

function formatUser(user) {
    return {
        username: user.username,
        email: user.email,
        admin: user.admin
    };
}

module.exports = {
    formatMessage,
    formatUser
};