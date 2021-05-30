const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
    roomID: mongoose.Schema.Types.ObjectId,
    sender: {username: String, email: String},
    message: String,
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Chat', ChatSchema);
