const RoomSchema = require('../models/RoomSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

function createRoom(name) {
    console.log("creating Room");
    let room = new RoomSchema({
        _id: new mongoose.Types.ObjectId(),
        name: name
    });
    room.save();
    console.log(`Room: ${name},  saved to Database`);

    return room;
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
            roomArray.push({name: room.name});
        });
    });
    return roomArray;
}

module.exports = {
    createRoom,
    getRoomByName,
    getRooms
}