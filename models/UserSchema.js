const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    rooms: [{roomID: Number, roomName: String}]
});

module.exports = mongoose.model('User', UserSchema);
