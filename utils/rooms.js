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

async function getAllRooms() {
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

async function getActiveRooms() {
    var roomArray = [];
    await RoomSchema.find({
        inactive: false
    }).then((rooms) => {
        rooms.forEach(function (room) {
            roomArray.push({
                name: room.name,
                owner: room.owner
            });
        });
    });
    return roomArray;
}

async function getInactiveRooms() {
    var roomArray = [];
    await RoomSchema.find({
        inactive: true
    }).then((rooms) => {
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

async function setRoomInactive(name) {
    const room = await RoomSchema.findOne({
        'name': name
    });
    room.overwrite({
        '_id': room._id,
        'name': room.name,
        'owner': room.owner,
        'inactive': true
    });
    await room.save();
}

module.exports = {
    createRoom,
    getRoomByName,
    getAllRooms,
    getActiveRooms,
    getInactiveRooms,
    deleteRoomByName,
    setRoomInactive
}