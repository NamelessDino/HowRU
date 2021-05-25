const RoomSchema = require('../models/RoomSchema');
const ChatSchema = require('../models/ChatSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

async function createRoom(name, user) {
    let room = new RoomSchema({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        owner: {
            username: user.username,
            email: user.email
        }
    });
    await room.save();
}

function getRoomByName(name) {
    return RoomSchema.findOne({
        'name': name
    })
}

async function getRooms() {
    var roomArray = [];
    await RoomSchema.find().then((rooms) => {
        rooms.forEach(function (room) {
            roomArray.push({
                name: room.name,
                owner: room.owner
            });
        });
    });
    return roomArray;
}

async function deleteRoomByName(roomName) {
    await ChatSchema.deleteMany({
        roomName: roomName
    }).then(async () => {
        await RoomSchema.deleteOne({
            name: roomName
        })
    });
    return true;
}

module.exports = {
    createRoom,
    getRoomByName,
    getRooms,
    deleteRoomByName
}