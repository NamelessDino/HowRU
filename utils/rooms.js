const RoomSchema = require('../models/RoomSchema');
const ChatSchema = require('../models/ChatSchema');
const {getMessagesFromRoom} = require('./chatMessages')
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
    console.log("getAllRooms wird gestartet");
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
async function getAllRoomsWithChatcount() {
    console.log("getAllRoomsWithChatcount wird gestartet");
    console.log("roomArrayWithChat wird angelegt");
    let roomArrayWithChat = [];
    console.log("roomArray wird angelegt");
    let roomArray = await getAllRooms();
    console.log("roomArray wird durch iteriert");
    await asyncForEach(roomArray, async (room) => {
        let chatArray = await getMessagesFromRoom(room.name);
        roomArrayWithChat.push({
            name: room.name,
            messagecount: chatArray.length
        });
    });
    console.log("roomArray ist fertig iteriert");
    console.log("return");
    roomArrayWithChat.sort(function(a, b){return b.messagecount - a.messagecount});
    console.log(roomArrayWithChat);
    return await roomArrayWithChat;
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

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

module.exports = {
    createRoom,
    getRoomByName,
    getAllRooms,
    getAllRoomsWithChatcount,
    getActiveRooms,
    getInactiveRooms,
    deleteRoomByName,
    setRoomInactive
}