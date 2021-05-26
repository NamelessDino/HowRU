const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    owner: {
        username: String,
        email: String
    },
    inactive: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Room', RoomSchema);