const moment = require('moment');

function formatMessage(username, date, text) {
    return {
        username,
        text,
        time: moment(date).format('DD.MM.YYYY - HH:mm')
    };
}

module.exports = formatMessage;