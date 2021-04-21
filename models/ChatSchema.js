const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
    roomName: String, //! id equals roomID
    sender: String,
    message: String,
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Chat', ChatSchema);
